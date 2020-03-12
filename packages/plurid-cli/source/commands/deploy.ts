import path from 'path';

import store from '../services/store';

import {
    userLoggedIn,
} from '../services/utilities/user';

import {
    authenticationClient,
} from '../services/graphql/client';



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


    // check if there is a plurid.app.yaml file and parse it

    // upload files

    // wait for deployment to finish
}


export default deployCommand;
