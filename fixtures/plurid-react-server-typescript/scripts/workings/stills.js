const path = require('path');

const {
    existsSync,
} = require('fs');

const {
    PluridStillsGenerator,
} = require('@plurid/plurid-react-server');



const main = () => {
    const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';
    const buildDirectoryPath = path.join(process.cwd(), BUILD_DIRECTORY);

    if (!existsSync(buildDirectoryPath)) {
        console.log('\n\tBuild directory does not exist. Run a project build process first, e.g. build.production.');
        return;
    }

    const serverFile = path.join(process.cwd(), `${BUILD_DIRECTORY}/server.js`);
    if (!existsSync(serverFile)) {
        console.log('\n\tServer not built. Run a server build process first, e.g. build.server.production.');
        return;
    }

    const stillsGenerator = new PluridStillsGenerator();
    stillsGenerator.initialize();
}


main();
