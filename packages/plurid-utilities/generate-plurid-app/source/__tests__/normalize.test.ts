// `ora` (the spinner the utilities import) ships ESM only; the suite tests nothing that spins
jest.mock('ora', () => () => ({ start: () => ({ stopAndPersist: () => {} }) }));

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
    normalizeAnswers,
    normalizeServices,
} from '../process/normalize';
import {
    executeCommand,
    ensureOwnedDirectory,
    copyDirectory,
} from '../utilities';



describe('the answers (C11)', () => {
    it('the default --services string becomes the internal service list', () => {
        expect(normalizeServices('graphql,redux,stripe')).toEqual(['Apollo', 'Redux', 'Stripe']);
        expect(normalizeServices(['Apollo', 'Stripe'])).toEqual(['Apollo', 'Stripe']);
        expect(normalizeServices(' GraphQL , redux ')).toEqual(['Apollo', 'Redux']);
        expect(normalizeServices('')).toEqual([]);
        expect(normalizeServices(undefined)).toEqual([]);
        expect(() => normalizeServices('mongo')).toThrow(/Unsupported service "mongo"/);
    });

    it('every choice is validated, case-insensitively, with the documented defaults', () => {
        const answers = normalizeAnswers({ directory: 'app', language: 'typescript', ui: 'react', renderer: 'server', manager: 'yarn', services: 'graphql', versioning: 'git' });
        expect(answers).toMatchObject({ language: 'TypeScript', ui: 'React', renderer: 'Server', manager: 'Yarn', services: ['Apollo'], versioning: 'Git', containerize: false, deployment: false });
        expect(normalizeAnswers({ directory: 'app' })).toMatchObject({ language: 'TypeScript', ui: 'React', renderer: 'Client', manager: 'NPM', services: [], versioning: 'None' });
        expect(() => normalizeAnswers({})).toThrow(/directory/);
        expect(() => normalizeAnswers({ directory: 'app', manager: 'bun' })).toThrow(/Unsupported manager "bun"/);
        expect(() => normalizeAnswers({ directory: 'app', ui: 'vue' })).toThrow(/not implemented/);
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

    it('a path with spaces is one argument', async () => {
        const ran = await executeCommand(process.execPath, ['-e', 'console.log(process.argv[1])', 'with space/dir']);
        expect(ran.stdout.trim()).toBe('with space/dir');
    });

    it('the destination must be missing or empty', () => {
        const root = temporary();
        const fresh = path.join(root, 'fresh');
        ensureOwnedDirectory(fresh);
        expect(fs.existsSync(fresh)).toBe(true);
        ensureOwnedDirectory(fresh); // empty: still fine
        fs.writeFileSync(path.join(fresh, 'keep.txt'), 'mine');
        expect(() => ensureOwnedDirectory(fresh)).toThrow(/not empty/);
        fs.rmSync(root, { recursive: true, force: true });
    });

    it('a copy completes before it resolves', async () => {
        const root = temporary();
        const source = path.join(root, 'source');
        fs.mkdirSync(path.join(source, 'nested'), { recursive: true });
        fs.writeFileSync(path.join(source, 'nested', 'file.txt'), 'x'.repeat(200000));
        const destination = path.join(root, 'destination');
        await copyDirectory(source, destination);
        expect(fs.readFileSync(path.join(destination, 'nested', 'file.txt'), 'utf8').length).toBe(200000);
        fs.rmSync(root, { recursive: true, force: true });
    });
});
