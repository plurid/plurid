jest.mock('ora', () => () => ({ start: () => ({ stopAndPersist: () => {} }) }));

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
    normalizeAnswers,
    packageNameOf,
} from '../process/normalize';
import {
    executeCommand,
    ensureOwnedDirectory,
    copyDirectory,
} from '../utilities';



describe('the answers', () => {
    it('every choice is validated, case-insensitively, with the documented defaults; the old shape\'s flags are refused', () => {
        const answers = normalizeAnswers({ directory: 'app', manager: 'yarn', versioning: 'git', install: false });
        expect(answers).toEqual({ directory: 'app', manager: 'Yarn', versioning: 'Git', install: false });
        expect(normalizeAnswers({ directory: 'app' })).toEqual({ directory: 'app', manager: 'NPM', versioning: 'None', install: true });
        expect(normalizeAnswers({ directory: 'app', manager: 'PNPM', language: 'typescript', ui: 'React' }).manager).toBe('pNPM');
        expect(() => normalizeAnswers({})).toThrow(/directory/);
        expect(() => normalizeAnswers({ directory: 'app', manager: 'bun' })).toThrow(/Unsupported manager "bun"/);
        expect(() => normalizeAnswers({ directory: 'app', language: 'javascript' })).toThrow(/TypeScript only/);
        expect(() => normalizeAnswers({ directory: 'app', ui: 'vue' })).toThrow(/React only/);
    });

    it('the package name is the directory\'s base name, npm-safe', () => {
        expect(packageNameOf('/tmp/My App!')).toBe('my-app');
        expect(packageNameOf('plurid-app/')).toBe('plurid-app');
        expect(packageNameOf('')).toBe('plurid-app');
    });
});


describe('the utilities (C12)', () => {
    const temporary = () => fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-generate-'));

    it('a failing command rejects with its exit code; a succeeding one resolves its output', async () => {
        await expect(executeCommand(process.execPath, ['-e', 'process.exit(3)'])).rejects.toThrow(/failed \(3\)/);
        await expect(executeCommand('definitely-not-a-program-xyz', ['--version'])).rejects.toThrow();
        const ran = await executeCommand(process.execPath, ['-e', 'console.log("a b")']);
        expect(ran.stdout.trim()).toBe('a b');
    });

    it('the destination must be ours: missing (created) or empty; a non-empty directory is refused', () => {
        const base = temporary();
        const fresh = path.join(base, 'fresh');
        ensureOwnedDirectory(fresh);
        expect(fs.existsSync(fresh)).toBe(true);
        ensureOwnedDirectory(fresh);
        fs.writeFileSync(path.join(fresh, 'keep.txt'), 'mine');
        expect(() => ensureOwnedDirectory(fresh)).toThrow(/not empty/);
        fs.rmSync(base, { recursive: true, force: true });
    });

    it('copyDirectory is awaited: the files are there when it resolves', async () => {
        const base = temporary();
        const source = path.join(base, 'source');
        fs.mkdirSync(path.join(source, 'nested'), { recursive: true });
        fs.writeFileSync(path.join(source, 'nested', 'file.txt'), 'content');
        const destination = path.join(base, 'destination');
        await copyDirectory(source, destination);
        expect(fs.readFileSync(path.join(destination, 'nested', 'file.txt'), 'utf8')).toBe('content');
        fs.rmSync(base, { recursive: true, force: true });
    });
});
