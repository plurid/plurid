import {
    createProgram,
    runGenerator,
} from '../program';



const actions = () => ({
    prompt: jest.fn(),
    generate: jest.fn(async () => undefined),
});

/** A program that throws instead of exiting, its output captured. */
const program = (
    handlers: ReturnType<typeof actions>,
) => {
    const output: string[] = [];
    const command = createProgram(handlers, '1.2.3')
        .exitOverride()
        .configureOutput({
            writeOut: (text) => { output.push(text); },
            writeErr: (text) => { output.push(text); },
        });
    return { command, output };
};

const argv = (...args: string[]) => ['node', 'generate-plurid-app', ...args];


describe('the command line (2026-09-29)', () => {
    it('takes the directory as its argument: `generate-plurid-app my-site` writes ./my-site', async () => {
        const handlers = actions();
        await program(handlers).command.parseAsync(argv('my-site', '-m', 'pnpm', '--no-install'));
        expect(handlers.generate).toHaveBeenCalledWith(expect.objectContaining({
            directory: 'my-site',
            manager: 'pnpm',
            versioning: 'none',
            install: false,
        }));
    });

    it('-d still names it, and the default is plurid-app', async () => {
        const named = actions();
        await program(named).command.parseAsync(argv('-d', 'elsewhere'));
        expect(named.generate).toHaveBeenCalledWith(expect.objectContaining({ directory: 'elsewhere', install: true }));

        const defaulted = actions();
        await program(defaulted).command.parseAsync(argv('-m', 'yarn'));
        expect(defaulted.generate).toHaveBeenCalledWith(expect.objectContaining({ directory: 'plurid-app', manager: 'yarn' }));
    });

    it('refuses two different directories, and an argument more, instead of dropping one', async () => {
        const conflicting = actions();
        await expect(program(conflicting).command.parseAsync(argv('one', '-d', 'two'))).rejects.toThrow(/Two directories were given/);
        expect(conflicting.generate).not.toHaveBeenCalled();

        const excess = actions();
        await expect(program(excess).command.parseAsync(argv('one', 'two'))).rejects.toThrow(/too many arguments/);
        expect(excess.generate).not.toHaveBeenCalled();
    });

    it('--help shows the argument, that no arguments means the prompts, and examples', async () => {
        const handlers = actions();
        const { command, output } = program(handlers);
        await expect(command.parseAsync(argv('--help'))).rejects.toMatchObject({ code: 'commander.helpDisplayed' });
        const help = output.join('');
        expect(help).toContain('[directory]');
        expect(help).toContain('Run with no arguments for the prompts.');
        expect(help).toContain('npx @plurid/generate-plurid-app my-site');
    });

    it('no arguments: the prompts; imported without a command line (no script in argv): nothing', async () => {
        const prompted = actions();
        await runGenerator(['node', 'generate-plurid-app'], prompted, '1.2.3');
        expect(prompted.prompt).toHaveBeenCalledTimes(1);
        expect(prompted.generate).not.toHaveBeenCalled();

        const imported = actions();
        await runGenerator(['node'], imported, '1.2.3');
        expect(imported.prompt).not.toHaveBeenCalled();
        expect(imported.generate).not.toHaveBeenCalled();
    });
});
