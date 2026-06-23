#!/usr/bin/env node
// #region imports
    // #region internal
    import { dev } from './dev';
    import { build } from './build';
    import { start } from './start';
    import { info } from './info';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The `plurid` CLI - `dev | build | start | info`.
 *
 * Generalizes denote's proven `scripts/dev.cjs` (esbuild client+server
 * build/watch + node child). One bin replaces every app's `scripts/` directory.
 */

const COMMANDS = ['dev', 'build', 'start', 'info'] as const;

type Command = typeof COMMANDS[number];


function usage(): void {
    process.stdout.write(
        [
            'plurid - batteries-included framework for plurid apps',
            '',
            'Usage: plurid <command> [options]',
            '',
            'Commands:',
            '  dev      Start the dev server (esbuild client+server, watch, live reload)',
            '  build    Production build -> build/{index.js, client/**, public/**}',
            '  start    Run the production server (node build/index.js)',
            '  info     Print the resolved environment + entry points',
            '',
            'Options:',
            '  -h, --help     Show this help',
            '  --watch        (dev) rebuild + restart on change',
            '  --port <n>     (dev) port to serve on (default 33721 or $PORT)',
            '',
        ].join('\n'),
    );
}


async function main(
    argv: string[],
): Promise<void> {
    const [command, ...rest] = argv;

    if (
        !command
        || command === '--help'
        || command === '-h'
        || command === 'help'
    ) {
        usage();
        return;
    }

    if (!(COMMANDS as readonly string[]).includes(command)) {
        process.stderr.write(`[plurid] unknown command: ${command}\n\n`);
        usage();
        process.exit(1);
    }

    switch (command as Command) {
        case 'dev':
            return dev(rest);
        case 'build':
            return build(rest);
        case 'start':
            return start(rest);
        case 'info':
            return info(rest);
    }
}


main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`[plurid] ${error?.stack || error}\n`);
    process.exit(1);
});
// #endregion module
