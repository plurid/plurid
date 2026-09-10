// #region imports
    // #region libraries
    import fs from 'node:fs';
    import path from 'node:path';
    // #endregion libraries


    // #region external
    import {
        Application,
    } from '~data/interfaces';
    import {
        manager as managerTypes,
        versioning as versioningTypes,
        TEMPLATE,
    } from '~data/constants';
    import {
        copyDirectory,
        executeCommand,
        loadingSpinner,
    } from '~utilities/index';
    // #endregion external


    // #region internal
    import {
        resolveVersions,
        resolveTemplateDirectory,
        KitVersions,
    } from './versions';
    // #endregion internal
// #endregion imports



// #region module
/** The package manager's program and its install / run spellings. */
export const managerCommands = (
    app: Pick<Application, 'manager'>,
): { install: [string, string[]]; run: string } => {
    if (app.manager === managerTypes.yarn) {
        return { install: ['yarn', ['install']], run: 'yarn' };
    }
    if (app.manager === managerTypes.pnpm) {
        return { install: ['pnpm', ['install']], run: 'pnpm' };
    }
    return { install: ['npm', ['install', '--no-audit', '--no-fund']], run: 'npm run' };
};

/** Every `__#KEY#__` in the template's text files, filled. */
export const stamp = (
    text: string,
    values: Record<string, string>,
): string => text.replace(/__#([A-Z_]+)#__/g, (match, key: string) => (key in values ? values[key] : match));

const TEXT_FILES = /\.(ts|tsx|json|md|txt|html|css|env|example)$|^\.env\.example$|^\.?gitignore$/;

const stampTree = (
    directory: string,
    values: Record<string, string>,
) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            stampTree(file, values);
            continue;
        }
        if (!TEXT_FILES.test(entry.name)) {
            continue;
        }
        const text = fs.readFileSync(file, 'utf8');
        const stamped = stamp(text, values);
        if (stamped !== text) {
            fs.writeFileSync(file, stamped);
        }
    }
};

/**
 * The template rendered into `directory`: the kit's shape, the name stamped, the manifest written,
 * the `.gitignore` restored (it ships as `gitignore`: `npm pack` strips a `.gitignore` from a package).
 */
export const renderTemplate = (
    app: Pick<Application, 'directory' | 'name' | 'manager'>,
    versions: KitVersions,
    templateDirectory: string,
) => {
    const values = {
        APP_NAME: app.name,
        MANAGER_RUN: managerCommands(app).run,
        VERSION_KIT: versions.kit,
        VERSION_REACT: versions.react,
        VERSION_SERVER: versions.server,
    };
    return copyDirectory(templateDirectory, app.directory).then(() => {
        stampTree(app.directory, values);
        // the manifest: from its template, the placeholders filled, the template file gone
        const templateManifest = path.join(app.directory, 'package.template.json');
        const manifest = JSON.parse(stamp(fs.readFileSync(templateManifest, 'utf8'), values));
        fs.writeFileSync(path.join(app.directory, 'package.json'), JSON.stringify(manifest, null, 4) + '\n');
        fs.unlinkSync(templateManifest);
        fs.renameSync(path.join(app.directory, 'gitignore'), path.join(app.directory, '.gitignore'));
    });
};

/** The files a generated application has (the test's contract), relative, in byte order (the same on every machine). */
export const listGenerated = (
    directory: string,
): string[] => {
    const files: string[] = [];
    const walk = (current: string, prefix: string) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
            if (entry.name === 'node_modules' || entry.name === '.git') {
                continue;
            }
            const relative = prefix ? prefix + '/' + entry.name : entry.name;
            if (entry.isDirectory()) {
                walk(path.join(current, entry.name), relative);
            } else {
                files.push(relative);
            }
        }
    };
    walk(directory, '');
    return files;
};

/**
 * THE GENERATION: the kit-shaped TypeScript application — `plurid.config.ts`, the client and the
 * server entries, the routes / shell / planes, a preserves stub, the public files, `package.json`
 * with `dev` / `build` / `start` / `check` / `test`, `tsconfig.json` — then git, then the install.
 */
const generateKitApplication = async (
    app: Application,
) => {
    console.log('\n\tGenerating the plurid application (the kit\'s shape, TypeScript).');

    const versions = resolveVersions();
    const templateDirectory = resolveTemplateDirectory(TEMPLATE);

    const filesSpinner = loadingSpinner('\tWriting the application files...').start();
    await renderTemplate(app, versions, templateDirectory);
    filesSpinner.stopAndPersist();
    console.log(`\t${listGenerated(app.directory).length} files written.`);

    if (app.versioning === versioningTypes.git) {
        await executeCommand('git', ['init'], { cwd: app.directory });
        console.log('\tGit repository initialized.');
    }

    if (app.install) {
        const commands = managerCommands(app);
        const installSpinner = loadingSpinner('\tInstalling the dependencies (a minute)...').start();
        await executeCommand(...commands.install, { cwd: app.directory });
        installSpinner.stopAndPersist();
        console.log('\tDependencies installed.');
    }

    const run = managerCommands(app).run;
    const seconds = Math.round((Date.now() - app.start) / 1000);
    console.log(`\n\tDone in ${seconds}s. Next:\n`);
    console.log(`\t    cd ${path.relative(process.cwd(), app.directory) || '.'}`);
    if (!app.install) {
        const [program, args] = managerCommands(app).install;
        console.log(`\t    ${[program, ...args].join(' ')}`);
    }
    console.log(`\t    ${run} dev\n`);
};
// #endregion module



// #region exports
export default generateKitApplication;
// #endregion exports
