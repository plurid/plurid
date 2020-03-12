import {
    executeCommand,
} from '../utilities';



const generateCommand = async () => {
    executeCommand('npx @plurid/generate-plurid-app');
}


export default generateCommand;
