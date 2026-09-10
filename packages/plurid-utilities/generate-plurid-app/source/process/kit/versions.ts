// #region imports
    // #region libraries
    import fs from 'node:fs';
    import path from 'node:path';
    // #endregion libraries
// #endregion imports



// #region module
export interface KitVersions {
    kit: string;
    react: string;
    server: string;
}

const WORKSPACE_MANIFESTS: Record<keyof KitVersions, string> = {
    kit: 'plurid-web/plurid-works/plurid-kit/package.json',
    react: 'plurid-web/plurid-works/plurid-react/package.json',
    server: 'plurid-web/plurid-works/plurid-react-server/package.json',
};

/**
 * Where this module runs from: `__dirname` in the CommonJS build and the tests; in the ESM build
 * (no `__dirname`) the executed script's directory (the `binder`), else the working directory.
 */
export const moduleBase = (): string => {
    if (typeof __dirname === 'string') {
        return __dirname;
    }
    return process.argv[1] ? path.dirname(path.resolve(process.argv[1])) : process.cwd();
};

/** The directories a file next to the bundle may live in, from `base` up three levels, `distribution` included. */
const nearby = (
    base: string,
    relative: string,
): string[] => {
    const roots = [base, path.join(base, '..'), path.join(base, '..', '..'), path.join(base, '..', '..', '..')];
    return roots.flatMap((root) => [path.join(root, relative), path.join(root, 'distribution', relative)]);
};

const readVersion = (
    file: string,
): string | undefined => {
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        return typeof data.version === 'string' ? data.version : undefined;
    } catch {
        return undefined;
    }
};

/**
 * The versions the generated `package.json` asks for: a built `versions.json` next to the bundle
 * wins wherever the generator runs from (the source tree included, once it is built); else the
 * workspace's manifests up the tree (the tests before a build); else `latest`.
 */
export const resolveVersions = (
    base: string = moduleBase(),
): KitVersions => {
    const built = nearby(base, 'versions.json').find((file) => fs.existsSync(file));
    if (built) {
        try {
            const data = JSON.parse(fs.readFileSync(built, 'utf8'));
            return { kit: data.kit || 'latest', react: data.react || 'latest', server: data.server || 'latest' };
        } catch {
            // fall through
        }
    }
    let directory = base;
    for (let depth = 0; depth < 8; depth += 1) {
        const packages = path.join(directory, 'packages');
        if (fs.existsSync(path.join(packages, WORKSPACE_MANIFESTS.kit))) {
            return {
                kit: readVersion(path.join(packages, WORKSPACE_MANIFESTS.kit)) || 'latest',
                react: readVersion(path.join(packages, WORKSPACE_MANIFESTS.react)) || 'latest',
                server: readVersion(path.join(packages, WORKSPACE_MANIFESTS.server)) || 'latest',
            };
        }
        directory = path.dirname(directory);
    }
    return { kit: 'latest', react: 'latest', server: 'latest' };
};

/**
 * Where the template lives: next to the bundle (`distribution/templates`, the published layout) or
 * in the package's source tree (the tests, a checkout).
 */
export const resolveTemplateDirectory = (
    template: string,
    base: string = moduleBase(),
): string => {
    const candidates = nearby(base, path.join('templates', 'web', 'react', template));
    const found = candidates.find((candidate) => fs.existsSync(path.join(candidate, 'plurid.config.ts')));
    if (!found) {
        throw new Error(`The template "${template}" is missing next to the generator (looked under ${base}).`);
    }
    return found;
};
/** The generator's own version: `versions.json` next to the bundle, else its `package.json` up the tree. */
export const resolveGeneratorVersion = (
    base: string = moduleBase(),
): string => {
    const built = nearby(base, 'versions.json').find((file) => fs.existsSync(file));
    if (built) {
        try {
            const data = JSON.parse(fs.readFileSync(built, 'utf8'));
            if (typeof data.generator === 'string') {
                return data.generator;
            }
        } catch {
            // fall through
        }
    }
    let directory = base;
    for (let depth = 0; depth < 6; depth += 1) {
        const manifest = path.join(directory, 'package.json');
        try {
            const data = JSON.parse(fs.readFileSync(manifest, 'utf8'));
            if (data.name === '@plurid/generate-plurid-app' && typeof data.version === 'string') {
                return data.version;
            }
        } catch {
            // keep climbing
        }
        directory = path.dirname(directory);
    }
    return '0.0.0';
};
// #endregion module

