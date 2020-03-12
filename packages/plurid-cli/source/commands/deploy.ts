import path from 'path';

import {
    userLoggedIn,
} from '../services/utilities/user';



const deployCommand = async (
    directory: string | undefined,
) => {
    if (!userLoggedIn()) {
        console.log('\n\tCould not deploy, user not authenticated. Run the \'authenticate\' command.');
    }

    const resolvedDirectory = directory
        ? path.join(__dirname, directory)
        : process.cwd();

    // check if there is a plurid.app.yaml file and parse it

    // upload files

    // wait for deployment to finish
}


export default deployCommand;
