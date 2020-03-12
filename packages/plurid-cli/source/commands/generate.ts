import {
    executeCommandSameTerminal,
} from '../utilities';



const generateCommand = async () => {
    // check if @plurid/generate-plurid-app is installed globally

    // install @plurid/generate-plurid-app

    console.log('\n\tLaunching generation program @plurid/generate-plurid-app...\n');

    executeCommandSameTerminal('npx @plurid/generate-plurid-app');
}


export default generateCommand;
