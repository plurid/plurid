import path from 'path';

import fs from 'fs';



export const copyDir = (
    src: any,
    dest: any,
) => {
    makeAppDirectory(dest);

	var files = fs.readdirSync(src);
	for(var i = 0; i < files.length; i++) {
		var current = fs.lstatSync(path.join(src, files[i]));
		if(current.isDirectory()) {
			copyDir(path.join(src, files[i]), path.join(dest, files[i]));
		} else if(current.isSymbolicLink()) {
			var symlink = fs.readlinkSync(path.join(src, files[i]));
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


export const makeAppDirectory = (
    appDir: string,
) => {
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir);
    }
}
