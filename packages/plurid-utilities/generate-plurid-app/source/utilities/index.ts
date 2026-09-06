// #region imports
    // #region libraries
    import {
        execFile,
    } from 'node:child_process';
    import fs from 'node:fs';
    import path from 'node:path';

    import ora from 'ora';
    // #endregion libraries


    // #region external
    import {
        AddScriptConfiguration,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
/**
 * Copy a directory tree, AWAITED (C12, 2026-09-06: the old stream copy returned before the bytes were
 * written, so a later step could read a half-copied file). Symlinks are copied as links.
 */
export const copyDirectory = async (
    src: string,
    dest: string,
) => {
    await fs.promises.cp(src, dest, {
        recursive: true,
        force: true,
        verbatimSymlinks: true,
    });
};


export const copyFile = async (
    src: string,
    dest: string,
) => {
    await fs.promises.copyFile(src, dest);
};


export const resolveAppDirectory = (
    appPath: string,
) => {
    if (appPath) {
        return path.resolve(process.cwd(), appPath);
    } else {
        return path.resolve(process.cwd(), './plurid-app');
    }
}


export const makeDirectory = (
    directory: string,
) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}


export const removeDirectory = async (
    directory: string,
) => {
    await fs.promises.rm(
        directory,
        {
            recursive: true,
            force: true,
        },
    );
}


/**
 * The destination must be OURS: missing (created) or an empty directory. A non-empty directory is
 * refused before anything is written or removed (C12: the client path removes `public`, `src` and
 * `.git` under the destination, so it must never be someone else's project).
 */
export const ensureOwnedDirectory = (
    directory: string,
) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        return;
    }
    if (!fs.lstatSync(directory).isDirectory()) {
        throw new Error(`The destination ${directory} exists and is not a directory.`);
    }
    if (fs.readdirSync(directory).length > 0) {
        throw new Error(`The destination ${directory} is not empty; choose an empty or new directory.`);
    }
}


export interface ExecutedCommand {
    stdout: string;
    stderr: string;
}

/**
 * Run a program with an ARGUMENT ARRAY — never a shell string — so a path with spaces or a
 * metacharacter is one argument (C12). Rejects when the program exits with a failure or cannot be
 * started, so a failed step stops the generation instead of being reported as a success.
 */
export const executeCommand = (
    file: string,
    args: string[] = [],
    options?: {
        cwd?: string;
    },
): Promise<ExecutedCommand> => {
    return new Promise(
        (resolve, reject) => {
            execFile(
                file,
                args,
                {
                    cwd: options?.cwd || process.cwd(),
                    maxBuffer: 64 * 1024 * 1024,
                },
                (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(
                            `${[file, ...args].join(' ')} failed${error.code !== undefined ? ` (${error.code})` : ''}: `
                            + (stderr || error.message).toString().trim(),
                        ));
                        return;
                    }
                    resolve({
                        stdout: stdout.toString(),
                        stderr: stderr.toString(),
                    });
                },
            );
        }
    );
}


export const addScript = async (
    configuration: AddScriptConfiguration,
) => {
    const {
        name,
        value,
        path,
    } = configuration;

    const file = fs.readFileSync(path);
    const jsonFile = JSON.parse(file.toString());

    if (!jsonFile.scripts) {
        jsonFile.scripts = {};
    }

    jsonFile.scripts[name] = value;

    const data = JSON.stringify(jsonFile, null, 4);
    fs.writeFileSync(path, data);
}


const defaultLoadingSpinnerOptions = {
    emptyline: true,
};

export const loadingSpinner = (
    text: string,
    options = defaultLoadingSpinnerOptions,
) => {
    if (options.emptyline) {
        console.log();
    }

    const spinner = ora({
        text,
        indent: 0,
        color: 'white',
    });

    return spinner;
}
// #endregion module
