import fs from 'fs';
import path from 'path';

import store from '../services/store';

import {
    userLoggedIn,
} from '../services/utilities/user';

import {
    authenticationClient,
} from '../services/graphql/client';



const parsePluridFile = (
    directory: string,
) => {
    try {
        const pluridFile = path.join(directory, './plurid.app.yaml');
        const contents = fs.readFileSync(pluridFile, 'utf8');
        return contents;
    } catch (error) {
        return {};
    }
}


const deployCommand = async (
    directory: string | undefined,
) => {
    if (!userLoggedIn()) {
        console.log('\n\tCould not deploy, user not authenticated. Run the \'authenticate\' command.');
    }

    const resolvedDirectory = directory
        ? path.join(__dirname, directory)
        : process.cwd();

    const token = store.get('token');
    const refreshToken = store.get('refreshToken');
    const data = {
        token,
        refreshToken,
    };
    const authenticatedClient = authenticationClient(data);

    const pluridAppConfiguration = parsePluridFile(resolvedDirectory);
    console.log(pluridAppConfiguration);

    // check if there is a plurid.app.yaml file and parse it

    // check if an app already exists and if user has access to it
    // or if app needs to be created

    // upload files

    // wait for deployment to finish
}


export default deployCommand;
