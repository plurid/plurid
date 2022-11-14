// Scripts commands file.
//
// Do not edit or Edit with care.


const {
    command,
    generateCommands,
} = require('./workings/logic');



const main = async () => {
    const commands = generateCommands();

    switch (command) {
        case 'start':
            commands.start();
            break;
        case 'start.local':
            commands.startLocal();
            break;
        case 'live':
            commands.live();
            break;
        case 'check':
            commands.check();
            break;
        case 'clean':
            commands.clean();
            break;
        case 'lint':
            commands.lint();
            break;
        case 'test':
            commands.test();
            break;
        case 'containerize.production':
            commands.containerizeProduction();
            break;
        case 'containerize.production.stills':
            commands.containerizeProductionStills();
            break;
        case 'build.client.local':
            commands.buildClientLocal();
            break;
        case 'build.client.development':
            commands.buildClientDevelopment();
            break;
        case 'build.client.production':
            commands.buildClientProduction();
            break;
        case 'build.server.local':
            commands.buildServerLocal();
            break;
        case 'build.server.development':
            commands.buildServerDevelopment();
            break;
        case 'build.server.production':
            commands.buildServerProduction();
            break;
        case 'build.stills':
            commands.buildStills();
            break;
        case 'build.local':
            commands.buildLocal();
            break;
        case 'build.local.stills':
            commands.buildLocalStills();
            break;
        case 'build.development':
            commands.buildDevelopment();
            break;
        case 'build.development.stills':
            commands.buildDevelopmentStills();
            break;
        case 'build.production':
            commands.buildProduction();
            break;
        case 'build.production.stills':
            commands.buildProductionStills();
            break;
    }
}

main();
