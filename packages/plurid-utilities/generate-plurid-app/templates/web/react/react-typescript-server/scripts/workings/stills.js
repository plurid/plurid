const path = require('path');

const {
    existsSync,
} = require('fs');

const {
    PluridStillsGenerator,
} = require('@plurid/plurid-react-server');


const {
    BUILD_DIRECTORY,
} = require ('./shared');



const main = () => {
    const buildDirectoryPath = path.join(
        process.cwd(),
        BUILD_DIRECTORY,
    );

    if (!existsSync(buildDirectoryPath)) {
        console.log('\n\tBuild directory does not exist. Run a project build process first, e.g. build.production.');
        return;
    }

    const serverFile = `${BUILD_DIRECTORY}/index.js`;
    const serverFilePath = path.join(process.cwd(), serverFile);
    if (!existsSync(serverFilePath)) {
        console.log('\n\tServer not built. Run a server build process first, e.g. build.server.production.');
        return;
    }

    const stillsGenerator = new PluridStillsGenerator({
        build: BUILD_DIRECTORY,
        server: serverFile,
    });
    stillsGenerator.initialize();
}


main();
