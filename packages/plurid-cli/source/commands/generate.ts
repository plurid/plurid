import {
    checkPackageInstalledGlobally,
    executeCommand,
    executeCommandSameTerminal,
} from '../utilities';



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

        console.log(`\n\tLaunching generator program ${generatorName}...\n`);
        executeCommandSameTerminal(`npx ${generatorName}`);
    } catch (error) {
        console.log('\n\n\tClosed plurid\' application generation process.\n');
    }
}


export default generateCommand;
