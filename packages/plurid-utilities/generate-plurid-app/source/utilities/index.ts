// #region imports
    // #region libraries
    import {
        exec,
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
export const copyDirectory = (
    src: string,
    dest: string,
) => {
    makeDirectory(dest);

	const files = fs.readdirSync(src);
	for(let i = 0; i < files.length; i++) {
        const current = fs.lstatSync(path.join(src, files[i]));

		if (current.isDirectory()) {
			copyDirectory(path.join(src, files[i]), path.join(dest, files[i]));
		} else if (current.isSymbolicLink()) {
			const symlink = fs.readlinkSync(path.join(src, files[i]));
			fs.symlinkSync(symlink, path.join(dest, files[i]));
		} else {
			copyFile(path.join(src, files[i]), path.join(dest, files[i]));
		}
	}
};


export const copyFile = (
    src: string,
    dest: string,
) => {
	const oldFile = fs.createReadStream(src);
	const newFile = fs.createWriteStream(dest);
    oldFile.pipe(newFile);
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
    try {
        await fs.promises.rm(
            directory,
            {
                recursive: true,
            },
        );
    } catch (error) {
        return;
    }
}


/**
 * Executes a shell command and return it as a Promise.
 *
 * @param command
 */
export const executeCommand = (
    command: string,
    options?: {
        cwd: string;
    },
) => {
    return new Promise(
        (resolve, _) => {
            exec(
                command,
                {
                    cwd: options?.cwd || process.cwd(),
                },
                (error, stdout, stderr) => {
                    if (error) {
                        console.warn(error);
                    }

                    resolve(stdout? stdout : stderr);
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
