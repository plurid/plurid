import {
    checkPackageInstalledGlobally,
    executeCommand,
    executeCommandSameTerminal,
} from '../services/utilities';



const generateCommand = async (
    options: any,
) => {
    try {
        const {
            online,
        } = options;

        const generatorName = '@plurid/generate-plurid-app';

        if (!online) {
            console.log(`\n\tSearching for generator program ${generatorName}...\n`);
            const generatorInstalled = await checkPackageInstalledGlobally(generatorName);

            if (!generatorInstalled) {
                console.log(`\tInstalling generator program ${generatorName}...\n`);
                await executeCommand(`npm install -g ${generatorName}`);
            }
        }

        const onlineInstall = online
            ? '--ignore-existing'
            : '';
        console.log(`\n\tLaunching generator program ${generatorName}...\n`);
        executeCommandSameTerminal(`npx ${onlineInstall} ${generatorName}`);
    } catch (error) {
        console.log('\n\n\tClosed plurid\' application generator program.\n');
    }
}


export default generateCommand;
