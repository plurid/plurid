/**
 * Build and verify a release's artifacts: every gate and `pnpm pack`, against a fresh tree of the source
 * commit. Not a publisher file (`PUBLISHER_FILES`): a change to how artifacts are built or verified
 * verifies them anew. It lived in `release.mjs`, a publisher file, so a fix to how a gate ran resumed
 * artifacts verified the old way (2026-10-22).
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { createArtifactDirectory, listWorkspace, packedJSON, releaseOrder, rememberArtifacts } from './release-plan.mjs';

const hash = (bytes, algorithm, encoding) => createHash(algorithm).update(bytes).digest(encoding);
const writeJSON = (file, value) => writeFileSync(file, JSON.stringify(value, null, 4) + '\n');

/** Verified tarballs of `sourceCommit` in a new artifact directory (or `directoryArg`), remembered for it. */
export const packRelease = ({ root, sourceCommit, directoryArg, say }) => {
    // PLURID_E2E_OWN_SERVER: the browser gates start the harness from the release tree; a development
    // server already on its port was reused, and the release tested the checkout (2026-10-20).
    const run = (file, args, cwd = root, extra = {}) => execFileSync(file, args, {
        cwd, stdio: 'inherit', env: { ...process.env, PLURID_PRESERVE_ARTIFACTS: '1', SMOKE_SKIP_GENERATE: '', SMOKE_SKIP_BROWSER: '', PLURID_E2E_OWN_SERVER: '1' }, ...extra,
    });
    const directory = createArtifactDirectory(root, sourceCommit, directoryArg);
    say('Building release artifacts in ' + directory);
    const source = join(directory, 'source');
    mkdirSync(source);
    run('git', ['archive', '--format=tar', '--output=' + join(directory, 'source.tar'), sourceCommit]);
    run('tar', ['-xf', join(directory, 'source.tar'), '-C', source]);
    // A new store prevents a source-overlaid consumer or an old output chunk from entering the release.
    const logs = join(directory, 'logs');
    mkdirSync(logs);
    const logged = (name, file, args, cwd = source) => {
        const log = join(logs, name + '.log');
        say(name + ' → ' + log);
        const fd = openSync(log, 'wx');
        try { run(file, args, cwd, { stdio: ['ignore', fd, fd] }); }
        finally { closeSync(fd); }
    };
    logged('install', 'pnpm', ['install', '--frozen-lockfile', '--ignore-scripts', '--store-dir', join(directory, 'store')]);
    const gates = [];
    const gate = (name, file, args) => {
        logged(name, file, args);
        gates.push(name);
    };
    gate('build', process.execPath, ['scripts/build-preserving.mjs']);
    for (const script of ['test.release', 'check', 'test', 'lint', 'check.modules', 'size', 'docs.tables.check']) {
        gate(script, 'pnpm', [script === 'test' ? 'test:preserving' : script]);
    }
    for (const project of ['chromium', 'perf', 'visual']) {
        gate('e2e.' + project, 'pnpm', ['--filter', 'plurid-render-test', 'e2e', '--project=' + project,
            '--output=' + join(directory, 'e2e-' + project), ...(project === 'visual' ? ['--update-snapshots=none'] : [])]);
    }
    const tarballs = join(directory, 'tarballs');
    mkdirSync(tarballs);
    const packages = [];
    for (const project of releaseOrder(listWorkspace(source))) {
        const output = run('pnpm', ['pack', '--config.ignore-scripts=true', '--pack-destination', tarballs], project.directory,
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
        const file = basename(output.split('\n').pop());
        const bytes = readFileSync(join(tarballs, file));
        const data = packedJSON(bytes);
        if (data.name !== project.data.name || data.version !== project.data.version || JSON.stringify(data).includes('workspace:')) {
            throw new Error(`Invalid packed manifest for ${project.data.name}`);
        }
        packages.push({ name: data.name, version: data.version, file: 'tarballs/' + file,
            sha256: hash(bytes, 'sha256', 'hex'), integrity: 'sha512-' + hash(bytes, 'sha512', 'base64') });
    }
    gate('smoke.pack', 'pnpm', ['smoke.pack', '--keep', '--tarballs', tarballs]);
    writeJSON(join(directory, 'release.json'), { schema: 1, sourceCommit, createdAt: new Date().toISOString(),
        node: process.version, gates, packages });
    rememberArtifacts(root, sourceCommit, directory);
    return directory;
};
