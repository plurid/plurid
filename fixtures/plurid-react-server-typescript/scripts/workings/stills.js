const path = require('path');

const {
    existsSync,
} = require('fs');

const {
    PluridStillsGenerator,
} = require('@plurid/plurid-react-server');



const main = () => {
    const buildDirectory = path.join(process.cwd(), 'build');
    if (!existsSync(buildDirectory)) {
        console.log('\n\tBuild directory does not exist. Run a project build process first, e.g. build.production.');
        return;
    }

    const serverFile = path.join(process.cwd(), 'build/server.js');
    if (!existsSync(serverFile)) {
        console.log('\n\tServer not built. Run a server build process first, e.g. build.server.production.');
        return;
    }

    const stillsGenerator = new PluridStillsGenerator();
    stillsGenerator.initialize();
}


main();
