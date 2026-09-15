#!/usr/bin/env node
/**
 * PUT THE ENGINE YOU JUST BUILT UNDER THE APP THAT USES IT.
 *
 * A consumer outside this repository installs the engine from the registry, so
 * nothing done here reaches it until a release: every fix lands in the engine's
 * own fixture, and the product carries a workaround until the version it needs
 * exists. That is the right default - it is how `docs/ENGINE_PRODUCT_FUSION.md`
 * came to be written, and testing against the PUBLISHED engine is what found
 * most of what is in it - but it is a poor loop for a fix you want to see in the
 * product today.
 *
 * So: build the packages, then copy each one's `distribution/` over the copy
 * pnpm extracted into the consumer's store. Nothing in either repository's
 * manifests changes, nothing is committed, CI never sees it, and
 * `pnpm install` in the consumer puts the registry's copy back.
 *
 *   pnpm sync <path-to-consumer>        build, then sync
 *   pnpm sync <path> --no-build         sync what is already built
 *   pnpm sync <path> --check            report what differs, change nothing
 *
 * A synced consumer is running code that does not exist on the registry. Say so
 * when reporting a result from it, and put it back with `pnpm install` there
 * before trusting anything about the published engine.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const args = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const flags = new Set(process.argv.slice(2).filter((argument) => argument.startsWith('--')));

const consumer = resolve(args[0] || '');


/** This workspace's publishable packages, from pnpm itself. */
const packages = () => {
    const output = execFileSync(
        'pnpm', ['-r', 'ls', '--depth', '-1', '--json'],
        { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], timeout: 120_000 },
    ).toString();

    return JSON.parse(output)
        .filter((project) => project.name
            && !project.private
            && !project.path.includes('/fixtures/'))
        .map((project) => ({ name: project.name, directory: project.path }));
};


/**
 * Every extracted copy of a package in the consumer's pnpm store.
 *
 * ALL of them, not the one the consumer's manifest names: a store holds a
 * directory per version and per peer-resolution, and a transitive dependency
 * can hold a different one. Syncing the manifest's copy alone leaves the app
 * running a mixture of two engines, which is worse than running the old one.
 */
const copiesIn = (store, name) => {
    const prefix = '@plurid+' + name.replace('@plurid/', '') + '@';

    return readdirSync(store)
        .filter((entry) => entry.startsWith(prefix))
        .map((entry) => join(store, entry, 'node_modules', name))
        .filter((path) => existsSync(join(path, 'package.json')));
};


const main = () => {
    if (!args[0]) {
        console.error('sync: which consumer? pass the path to its repository root');
        process.exit(1);
    }

    const store = join(consumer, 'node_modules', '.pnpm');
    if (!existsSync(store)) {
        console.error(`sync: no pnpm store under ${consumer} - is it installed?`);
        process.exit(1);
    }

    if (!flags.has('--no-build') && !flags.has('--check')) {
        console.log('sync: building');
        execFileSync('pnpm', ['-r', 'build'], { cwd: root, stdio: 'inherit' });
    }

    let synced = 0;
    let stale = 0;
    let missing = 0;

    for (const project of packages()) {
        const built = join(project.directory, 'distribution');
        if (!existsSync(built)) {
            continue;
        }

        const copies = copiesIn(store, project.name);
        if (copies.length === 0) {
            missing += 1;
            continue;
        }

        for (const copy of copies) {
            const target = join(copy, 'distribution');
            const version = JSON.parse(readFileSync(join(copy, 'package.json'), 'utf8')).version;

            if (flags.has('--check')) {
                const at = existsSync(target) ? statSync(target).mtimeMs : 0;
                if (statSync(built).mtimeMs > at) {
                    console.log(`  stale  ${project.name}@${version}`);
                    stale += 1;
                }
                continue;
            }

            // replaced, not merged: a file the build stopped emitting has to
            // stop existing, or the app keeps importing something the engine
            // no longer has
            rmSync(target, { recursive: true, force: true });
            cpSync(built, target, { recursive: true });
            console.log(`  synced ${project.name}@${version}`);
            synced += 1;
        }
    }

    if (flags.has('--check')) {
        console.log(stale === 0
            ? 'sync: the consumer is up to date with this build'
            : `sync: ${stale} stale, run without --check`);
        process.exit(stale === 0 ? 0 : 1);
    }

    console.log(`sync: ${synced} copied${missing > 0 ? `, ${missing} not used by this consumer` : ''}`);
    console.log(`sync: ${consumer} is now running UNPUBLISHED code - \`pnpm install\` there puts the registry's copy back`);
};

main();
