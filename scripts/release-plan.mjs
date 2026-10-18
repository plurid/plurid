import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';

export const GENERATOR = '@plurid/generate-plurid-app';
export const GENERATOR_INPUTS = [
    '@plurid/plurid-kit', '@plurid/plurid-react', '@plurid/plurid-react-server',
];

export const listWorkspace = (root) => JSON.parse(execFileSync(
    'pnpm', ['-r', 'ls', '--depth', '-1', '--json'],
    { cwd: root, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'inherit'] },
))
    .filter((project) => project.name && !project.private && !project.path.includes('/fixtures/'))
    .map((project) => ({
        directory: project.path,
        manifest: join(project.path, 'package.json'),
        data: JSON.parse(readFileSync(join(project.path, 'package.json'), 'utf8')),
    }))
    .sort((a, b) => a.data.name.localeCompare(b.data.name));

/** Metadata reads use HTTP directly: no npm cache, login, or filesystem writes in a dry run. */
export const registryPackage = async (name, version = 'latest') => {
    const response = await fetch(
        `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
        { signal: AbortSignal.timeout(30000), headers: { 'cache-control': 'no-cache' } },
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Registry lookup failed for ${name}@${version}: HTTP ${response.status}`);
    const data = await response.json();
    if (data.name !== name || typeof data.version !== 'string') {
        throw new Error(`Invalid registry response for ${name}@${version}`);
    }
    return data;
};

/** Alpha versions use a trailing integer, including numbers too large for a JS Number. */
export const nextVersion = (version) => {
    const match = /^(\d+\.\d+\.\d+)-(\d+)$/.exec(version);
    if (!match) throw new Error(`'${version}' is not an alpha version (0.0.0-N); bump it manually.`);
    return `${match[1]}-${BigInt(match[2]) + 1n}`;
};

/** The source, shipped assets and inputs that can change the generated package all count. */
export const affectsPackage = (file, directory) => {
    if (/^(scripts\/tsup\/|pnpm-(workspace\.yaml|lock\.yaml)$)/.test(file)) return true;
    if (!file.startsWith(directory + '/')) return false;
    const local = file.slice(directory.length + 1);
    if (/(^|\/)(__tests__|__performance__|coverage|node_modules|distribution)(\/|$)/.test(local)
        || /\.(test|spec)\.[cm]?[jt]sx?$/.test(local)) return false;
    return /^(source\/|templates\/|binder\/|package\.json$|tsup\.config\.|tsconfig[^/]*\.json$|configurations\/tsconfig[^/]*\.json$|README|LICENSE)/.test(local);
};

export const changedFiles = (root, baseline) => [
    ...execFileSync('git', ['diff', '--name-only', '-z', baseline, '--'], { cwd: root, encoding: 'utf8' }).split('\0'),
    ...execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0'),
].filter(Boolean);

/** Runtime dependencies, peer minimums, and the generator's baked pins move as one chain. */
export const dependencyNames = (entry) => [
    ...Object.keys(entry.data.dependencies ?? {}),
    ...Object.keys(entry.data.peerDependencies ?? {}),
    ...(entry.data.name === GENERATOR ? GENERATOR_INPUTS : []),
];

export const planRelease = ({ projects, published, files = [], root = '', all = false, noBump = false }) => {
    const plan = projects.map((project) => {
        const { name, version } = project.data;
        const registry = published[name] ?? null;
        const directory = relative(root, project.directory).split('\\').join('/');
        const changed = all || files.some((file) => affectsPackage(file, directory));
        if (registry && registry !== version && nextVersion(registry) !== version) {
            throw new Error(`${name}: workspace ${version} must equal registry ${registry} or its next alpha.`);
        }
        return {
            ...project, name, version, published: registry, changed,
            target: changed && !noBump && registry === version ? nextVersion(version) : version,
            why: all ? 'coordinated release' : changed ? 'shipped files or build inputs changed' : 'no shipped change',
        };
    });
    let moved;
    do {
        moved = false;
        for (const entry of plan) {
            if (entry.target !== entry.published || noBump) continue;
            const dependencies = dependencyNames(entry);
            if (!plan.some((other) => dependencies.includes(other.name) && other.target !== other.published)) continue;
            entry.target = nextVersion(entry.version);
            entry.changed = true;
            entry.why = 'follows a released dependency or baked generator pin';
            moved = true;
        }
    } while (moved);
    return plan;
};

export const releaseOrder = (entries) => {
    const pending = new Map(entries.map((entry) => [entry.name ?? entry.data.name, entry]));
    const ordered = [];
    while (pending.size) {
        const ready = [...pending.values()].filter((entry) => !dependencyNames(entry)
            .some((name) => pending.has(name)));
        if (!ready.length) throw new Error(`Cyclic release dependencies: ${[...pending.keys()].join(', ')}`);
        for (const entry of ready) {
            ordered.push(entry);
            pending.delete(entry.name ?? entry.data.name);
        }
    }
    return ordered;
};

/** Read one regular tar entry in memory. Inspection never extracts or removes files. */
export const packedJSON = (bytes, name = 'package/package.json') => {
    const tar = gunzipSync(bytes);
    for (let offset = 0; offset + 512 <= tar.length;) {
        const header = tar.subarray(offset, offset + 512);
        const file = header.subarray(0, 100).toString().replace(/\0.*$/, '');
        if (!file) break;
        const size = parseInt(header.subarray(124, 136).toString().replace(/\0.*$/, '').trim(), 8);
        if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > tar.length) {
            throw new Error('Invalid package tarball');
        }
        if (file === name && (header[156] === 0 || header[156] === 48)) {
            return JSON.parse(tar.subarray(offset + 512, offset + 512 + size).toString());
        }
        offset += 512 + Math.ceil(size / 512) * 512;
    }
    throw new Error(`Tarball is missing ${name}`);
};


export const REQUIRED_GATES = ['build', 'test.release', 'check', 'test', 'lint', 'check.modules',
    'size', 'docs.tables.check', 'e2e.chromium', 'e2e.perf', 'e2e.visual', 'smoke.pack'];

/** Validate everything before an upload, including artifacts left by a partial release. */
export const verifyArtifacts = (manifest, projects, sourceCommit, readArtifact) => {
    if (manifest.schema !== 1 || manifest.sourceCommit !== sourceCommit
        || REQUIRED_GATES.some((name) => !manifest.gates?.includes(name))) {
        throw new Error('Artifacts do not cover this source commit and all required gates.');
    }
    if (manifest.packages?.length !== projects.length || new Set(manifest.packages.map((p) => p.name)).size !== projects.length) {
        throw new Error('Artifact manifest must contain the complete public workspace exactly once.');
    }
    return releaseOrder(manifest.packages.map((entry) => {
        if (typeof entry.file !== 'string' || !/^tarballs\/[^/\\]+\.tgz$/.test(entry.file)) throw new Error('Invalid artifact path.');
        const bytes = readArtifact(entry.file);
        const data = packedJSON(bytes);
        const project = projects.find((p) => p.data.name === entry.name);
        if (!project || data.name !== entry.name || data.version !== entry.version || entry.version !== project.data.version
            || createHash('sha256').update(bytes).digest('hex') !== entry.sha256
            || 'sha512-' + createHash('sha512').update(bytes).digest('base64') !== entry.integrity) {
            throw new Error(`Artifact mismatch: ${entry.name}`);
        }
        return { ...entry, data };
    }));
};


const RELEASE_MODES = ['--dry-run', '--prepare', '--pack', '--publish', '--verify-registry'];
const ARTIFACT_MODES = ['--pack', '--publish', '--verify-registry'];

/** Artifact paths are optional; preparation flags must never be mistaken for a directory. */
export const parseReleaseArguments = (args) => {
    let mode;
    let directory;
    let all = false;
    let noBump = false;
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (RELEASE_MODES.includes(arg)) {
            if (mode) throw new Error('Choose one release phase.');
            mode = arg;
            if (ARTIFACT_MODES.includes(mode) && args[index + 1] && !args[index + 1].startsWith('--')) {
                directory = args[++index];
            }
        } else if (arg === '--all') all = true;
        else if (arg === '--no-bump') noBump = true;
        else throw new Error(`Unknown argument ${arg}`);
    }
    mode ??= '--dry-run';
    if (ARTIFACT_MODES.includes(mode) && (all || noBump)) {
        throw new Error('--all/--no-bump apply only to planning or preparation.');
    }
    return { mode, directory, all, noBump };
};

const releaseState = (root) => join(root, '.out', 'releases');
const releasePointer = (root, commit) => {
    if (!/^[a-f0-9]{40}$|^[a-f0-9]{64}$/.test(commit)) throw new Error('Invalid release commit.');
    return join(releaseState(root), commit + '.json');
};

export const createArtifactDirectory = (root, commit, requested) => {
    releasePointer(root, commit);
    if (requested) {
        const directory = resolve(root, requested);
        if (existsSync(directory)) throw new Error(`Choose a new artifact directory; preserving ${directory}`);
        mkdirSync(directory, { recursive: true });
        return directory;
    }
    const parent = releaseState(root);
    mkdirSync(parent, { recursive: true });
    // Keep the fresh source outside this checkout so Node cannot fall back to its node_modules.
    return mkdtempSync(join(tmpdir(), 'plurid-release-' + commit.slice(0, 12) + '-'));
};

/** Remember only completed verification. Failed builds never displace a resumable release. */
export const rememberArtifacts = (root, commit, directory) => {
    const manifest = JSON.parse(readFileSync(join(directory, 'release.json'), 'utf8'));
    if (manifest.sourceCommit !== commit) throw new Error('Cannot remember artifacts for another commit.');
    const pointer = releasePointer(root, commit);
    mkdirSync(releaseState(root), { recursive: true });
    writeFileSync(pointer, JSON.stringify({ sourceCommit: commit, directory: resolve(directory) }, null, 4) + '\n');
};

export const rememberedArtifacts = (root, commit) => {
    const pointer = releasePointer(root, commit);
    if (!existsSync(pointer)) return null;
    const record = JSON.parse(readFileSync(pointer, 'utf8'));
    if (record.sourceCommit !== commit || typeof record.directory !== 'string' || !isAbsolute(record.directory)) {
        throw new Error(`Invalid release artifact record: ${pointer}`);
    }
    // Do not replace a recorded partial round if its files have been moved or modified.
    if (!existsSync(join(record.directory, 'release.json'))) {
        throw new Error(`Recorded release artifacts are missing: ${record.directory}. Restore them or provide an explicit directory.`);
    }
    return record.directory;
};
