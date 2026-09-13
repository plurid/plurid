#!/usr/bin/env node
/**
 * THE RELEASE, IN ONE COMMAND.
 *
 * Until 2026-09-13 there was no release automation of any kind — no bump script, no changesets, no
 * tags, no changelog — and the cost showed: a whole round (2026-09-05) was bumped and then never
 * published, so the workspace integers sat one ahead of npm for eight days and nobody could tell by
 * looking. This script is the missing piece.
 *
 *   pnpm release --dry-run     say exactly what would happen, touch nothing
 *   pnpm release               bump what changed, verify, publish, tag
 *   pnpm release --skip-verify skip `pnpm verify` (only if you just ran it)
 *   pnpm release --no-bump     publish the versions as they stand
 *   pnpm release --force       publish even though CI is red or still running
 *
 * WHAT COUNTS AS CHANGED: a package's SHIPPED source — `source/**` minus `__tests__` — against the
 * last release tag (`release/<date>`). Tests do not ship, so a test-only change is not a release.
 * With no tag yet (the first run), a package is "changed" when its workspace version is already
 * ahead of the registry, which is what a hand-bump leaves behind.
 *
 * αver (`0.0.0-N`): only the trailing integer moves, and the CHANGED CHAIN goes together — a package
 * that changed is bumped, and every `>=0.0.0-N` peer range pointing at it follows.
 */
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const dryRun = process.argv.includes('--dry-run');
const skipVerify = process.argv.includes('--skip-verify');
const noBump = process.argv.includes('--no-bump');
const force = process.argv.includes('--force');

const run = (command, options = {}) => execSync(command, { cwd: root, stdio: 'inherit', ...options });
const read = (command) => execSync(command, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();

const fail = (message) => {
    console.error(`\n[release] ${message}\n`);
    process.exit(1);
};

const say = (message) => console.log(`[release] ${message}`);


// #region the workspace
/** The public projects, from pnpm itself — private packages and fixtures are never published. */
const listWorkspace = () => JSON.parse(
    execFileSync('pnpm', ['-r', 'ls', '--depth', '-1', '--json'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString(),
)
    .filter((project) => project.name && !project.private && !project.path.includes('/fixtures/'))
    .map((project) => ({
        directory: project.path,
        manifest: join(project.path, 'package.json'),
        data: JSON.parse(readFileSync(join(project.path, 'package.json'), 'utf8')),
    }))
    .sort((a, b) => a.data.name.localeCompare(b.data.name));

const registryVersion = (name) => {
    try {
        return execFileSync('npm', ['view', name, 'version'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
        return null;                             // never published
    }
};

/** `0.0.0-37` → `0.0.0-38`. αver moves the trailing integer and nothing else. */
const nextVersion = (version) => {
    const match = /^(\d+\.\d+\.\d+)-(\d+)$/.exec(version);
    if (!match) {
        fail(`'${version}' is not an αver version (0.0.0-N) — bump it by hand.`);
    }
    return `${match[1]}-${Number(match[2]) + 1}`;
};
// #endregion the workspace


// #region preflight
/** A dry run changes nothing, so the git checks only warn — you want the plan BEFORE you commit. */
const require_ = (condition, message) => {
    if (condition) {
        return;
    }
    if (dryRun) {
        say(`WARNING: ${message}`);
    } else {
        fail(message);
    }
};

require_(read('git rev-parse --abbrev-ref HEAD') === 'master', 'not on master.');
require_(read('git status --porcelain') === '',
    'the working tree is dirty — commit first (pnpm refuses to publish from a dirty tree too).');
run('git fetch --quiet origin master', { stdio: 'ignore' });
require_(read('git rev-parse HEAD') === read('git rev-parse origin/master'),
    'HEAD and origin/master differ — push first, and let CI go green before publishing.');

let account;
try {
    account = read('pnpm whoami');
} catch {
    fail('not authenticated — `pnpm login` (note: `npm login` writes a different config).');
}
say(`authenticated as ${account}`);

/**
 * CI IS A GATE, NOT A NOTE. A publish cannot be taken back, and CI is the only independent check that
 * the picture gate, the browser suite and the container run pass — so a run that is red, or still
 * going, stops the release. `--force` is the escape, and says what it is overriding.
 *
 * A run that cannot be found (no `gh`, no CI on this fork) only warns: absence of evidence is not
 * evidence of a failure, and the gate should not be unusable where CI does not exist.
 */
let ci = null;
try {
    ci = JSON.parse(read('gh run list --limit 20 --json headSha,conclusion,status,displayTitle'))
        .find((entry) => entry.headSha === read('git rev-parse HEAD')) ?? null;
} catch {
    say('(could not read CI status — `gh` unavailable)');
}

if (!ci) {
    say('WARNING: no CI run found for this commit.');
} else if (ci.status !== 'completed') {
    const message = `CI is still running on this commit (${ci.status}) — wait for it:`
        + '\n             gh run watch --exit-status';
    if (force) {
        say(`WARNING (--force): ${message}`);
    } else if (!dryRun) {
        fail(`${message}\n\n             …or re-run with --force to publish anyway.`);
    } else {
        say(`WARNING: ${message}`);
    }
} else if (ci.conclusion !== 'success') {
    const message = `CI on this commit concluded '${ci.conclusion}', not success.`;
    if (force) {
        say(`WARNING (--force): ${message}`);
    } else if (!dryRun) {
        fail(`${message} Fix it, or re-run with --force to publish anyway.`);
    } else {
        say(`WARNING: ${message}`);
    }
} else {
    say('CI is green on this commit');
}
// #endregion preflight


// #region what changed
const tags = read('git tag -l "release/*" --sort=-creatordate').split('\n').filter(Boolean);
const baseline = tags[0] || null;
say(baseline ? `baseline: ${baseline}` : 'baseline: none yet (first run — reading the registry instead)');

const packages = listWorkspace();
const plan = [];

for (const project of packages) {
    const { name, version } = project.data;
    const published = registryVersion(name);

    let changed;
    let why;
    if (baseline) {
        const relative = project.directory.replace(root + '/', '');
        const diff = read(`git diff --name-only ${baseline}..HEAD -- '${relative}/source' || true`)
            .split('\n').filter((file) => file && !file.includes('__tests__'));
        changed = diff.length > 0;
        why = changed ? `${diff.length} shipped file(s) changed since ${baseline}` : 'no shipped change';
    } else {
        changed = published !== null && published !== version;
        why = changed ? `workspace ${version} is ahead of the registry ${published}` : 'level with the registry';
    }

    const target = (changed && !noBump && published === version) ? nextVersion(version) : version;
    plan.push({ ...project, name, version, published, target, changed, why });
}

const publishing = plan.filter((entry) => entry.target !== entry.published);
const bumping = plan.filter((entry) => entry.target !== entry.version);

console.log('');
const width = Math.max(...plan.map((entry) => entry.name.length));
for (const entry of plan) {
    const mark = entry.target !== entry.published ? 'PUBLISH' : '       ';
    const move = entry.target !== entry.version ? `  (bump ${entry.version} → ${entry.target})` : '';
    console.log(`  ${mark}  ${entry.name.padEnd(width)}  registry ${String(entry.published ?? '—').padEnd(10)} → ${entry.target}${move}`);
    if (!entry.changed && entry.target === entry.published) {
        console.log(`           ${' '.repeat(width)}  ${entry.why}`);
    }
}
console.log('');

if (publishing.length === 0) {
    say('nothing to publish — every package matches the registry.');
    process.exit(0);
}
// #endregion what changed


// #region the bump
if (dryRun) {
    say(`dry run: would publish ${publishing.length} package(s)${bumping.length ? `, bumping ${bumping.length}` : ''}.`);
    run('pnpm -r publish --dry-run --no-git-checks');
    process.exit(0);
}

if (bumping.length > 0) {
    const moved = new Map(bumping.map((entry) => [entry.name, entry.target]));

    for (const entry of bumping) {
        const manifest = JSON.parse(readFileSync(entry.manifest, 'utf8'));
        manifest.version = entry.target;
        writeFileSync(entry.manifest, JSON.stringify(manifest, null, 4) + '\n');
        say(`${entry.name} → ${entry.target}`);
    }

    // THE CHANGED CHAIN GOES TOGETHER: a `>=0.0.0-N` peer pointing at a bumped sibling follows it,
    // so an old sibling from the registry is refused rather than crashing at runtime.
    for (const project of packages) {
        const manifest = JSON.parse(readFileSync(project.manifest, 'utf8'));
        let touched = false;
        for (const [dependency, target] of moved) {
            const range = manifest.peerDependencies?.[dependency];
            if (range && range.startsWith('>=')) {
                manifest.peerDependencies[dependency] = `>=${target}`;
                touched = true;
                say(`  ${project.data.name}: peer ${dependency} → >=${target}`);
            }
        }
        if (touched) {
            writeFileSync(project.manifest, JSON.stringify(manifest, null, 4) + '\n');
        }
    }
}
// #endregion the bump


// #region verify, publish, tag
if (!skipVerify) {
    say('running the full gate (pnpm verify) — several minutes');
    run('pnpm verify');
} else {
    say('skipping pnpm verify (--skip-verify)');
}

say(`publishing ${publishing.length} package(s) — pnpm walks the workspace topologically and skips what is already on the registry`);
run('pnpm -r publish --no-git-checks');

const tag = `release/${new Date().toISOString().slice(0, 10)}`;
const existing = read(`git tag -l ${tag}`);
const unique = existing ? `${tag}-${Date.now().toString(36).slice(-4)}` : tag;

if (bumping.length > 0) {
    run('git add -A');
    run(`git commit -m "release: ${publishing.map((entry) => `${entry.name}@${entry.target}`).join(', ')}"`);
}
run(`git tag -a ${unique} -m "release ${unique}"`);
say(`tagged ${unique} — the next run measures "changed" from here`);

console.log('');
say('published. Now prove it from the REGISTRY (smoke.pack only ever sees local tarballs):');
console.log('');
console.log('    cd $(mktemp -d) && npx @plurid/generate-plurid-app -d registry-check && cd registry-check');
console.log('    npm install && npx plurid build && npx plurid start');
console.log('    # GET / must contain data-plurid-entity="PluridView"');
console.log('');
if (bumping.length > 0) {
    say('a release commit was made — `git push --follow-tags` when you are happy with it.');
} else {
    say('`git push --follow-tags` to publish the tag.');
}
// #endregion verify, publish, tag
