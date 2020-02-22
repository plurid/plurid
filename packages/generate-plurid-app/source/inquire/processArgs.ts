import path from 'path';

import fs from 'fs';

import {
    exec,
} from 'child_process';



const copyDir = (
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


const copyFile = (
    src: any,
    dest: any,
) => {
	var oldFile = fs.createReadStream(src);
	var newFile = fs.createWriteStream(dest);
    oldFile.pipe(newFile);
};


const resolveAppDirectory = (
    appPath: string,
) => {
    if (appPath) {
        return path.resolve(process.cwd(), appPath);
    } else {
        return path.resolve(process.cwd(), './plurid-app');
    }
}


const makeAppDirectory = (
    appDir: string,
) => {
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir);
    }
}


const generatedPluridReactApplication = (
    app: any,
) => {
    console.log('\n\tAdding the plurid\' packages to the React Application...');

    const requiredPluridReactPackages = [
        '@plurid/generate-plurid-app',
        '@plurid/plurid-functions',
        '@plurid/plurid-icons-react',
        '@plurid/plurid-react',
        '@plurid/plurid-themes',
        '@plurid/plurid-ui-react',
        'hammerjs',
        'react-redux',
        'redux',
        'redux-thunk',
        'styled-components',
    ];

    const pluridReactPackages = requiredPluridReactPackages.join(' ');

    exec(`yarn add ${pluridReactPackages}`, {
        cwd: app.directory,
    }, (error, stdout, stderr) => {
        console.log('\tPlurid\' packages added succesfully.');

        console.log('\n\tSetting files.');

        const publicDir = path.join(app.directory, './public');
        const sourceDir = path.join(app.directory, './src');
        fs.rmdirSync(publicDir, {recursive: true});
        fs.rmdirSync(sourceDir, {recursive: true});

        const base = './node_modules/@plurid/generate-plurid-app/distribution/files/react-typescript-client';

        const templatePublicDir = path.join(app.directory, base + '/public');
        const templateSourceDir = path.join(app.directory, base + '/src');
        copyDir(templatePublicDir, publicDir);
        copyDir(templateSourceDir, sourceDir);

        console.log('\n\tAll done.');

        console.log('\n\tChange directory, run `yarn start` and enjoy.\n');
    });
}

const createReactApplication = async (
    app: any,
) => {
    const language = app.language === 'typescript'
        ? '--template typescript'
        : '';

    console.log('\tGenerating the React Application...');
    exec(`yarn create react-app ${app.directory} ${language}`, () => {
        console.log('\tReact Application generated successfully.');

        generatedPluridReactApplication(app);
    });
}


const createApplication = async (
    app: any,
) => {
    switch (app.ui) {
        case 'react':
            createReactApplication(app);
    }
}


export const processArgs = async (
    program: any,
) => {
    let app: string;
    let language: string;
    let ui: string;
    let type: string;

    if (program.app === undefined) {
        console.log('App directory (-a or --app) must be specified.');
        process.exit(1);
    }

    app = resolveAppDirectory(program.app);

    makeAppDirectory(app);

    switch(program.language) {
        case 'typescript':
        case 'javascript':
            language = program.language;
            break;
        default:
            language = 'typescript';
    }

    switch(program.ui) {
        case 'html':
        case 'react':
        case 'vue':
            ui = program.ui;
            break;
        default:
            ui = 'react';
    }

    switch(program.type) {
        case 'client':
        case 'ssr':
            type = program.type;
            break;
        default:
            type = 'client';
    }

    console.log('\n\tThe plurid\' application will be generated at:');
    console.log(`\t${app}`);
    console.log('\tThe application language is:', language);
    console.log('\tThe application is based on:', ui);
    console.log('\tThe application type is:', type);
    console.log('\n');

    const application = {
        directory: app,
        language,
        ui,
        type,
    };
    await createApplication(application);
}
