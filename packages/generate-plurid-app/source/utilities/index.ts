import path from 'path';

import fs from 'fs';

import {
    exec,
} from 'child_process';

import {
    AddScriptConfiguration,
} from '../data/interfaces';



export const copyDirectory = (
    src: any,
    dest: any,
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
    src: any,
    dest: any,
) => {
	var oldFile = fs.createReadStream(src);
	var newFile = fs.createWriteStream(dest);
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

    let data = JSON.stringify(jsonFile, null, 4);
    fs.writeFileSync(path, data);
}
