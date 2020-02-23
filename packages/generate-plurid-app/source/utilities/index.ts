import path from 'path';

import fs from 'fs';



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
