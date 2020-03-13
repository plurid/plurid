import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';

import store from '../services/store';

import {
    userLoggedIn,
} from '../services/utilities/user';

import {
    authenticationClient,
} from '../services/graphql/client';



const parseAppConfigurationFile = (
    directory: string,
) => {
    try {
        const pluridFile = path.join(directory, './plurid.app.yaml');
        const contents = fs.readFileSync(pluridFile, 'utf8');
        const data = yaml.safeLoad(contents);
        return data;
    } catch (error) {
        return {};
    }
}

const computeAppName = (
    pluridAppConfiguration: any,
    resolvedDirectory: string,
) => {
    return pluridAppConfiguration.name || resolvedDirectory.split(path.sep).pop();
}


const deployCommand = async (
    directory: string | undefined,
) => {
    if (!userLoggedIn()) {
        console.log('\n\tCould not deploy, user not authenticated. Run the \'authenticate\' command.');
    }

    const token = store.get('token');
    const refreshToken = store.get('refreshToken');
    const data = {
        token,
        refreshToken,
    };
    const authenticatedClient = authenticationClient(data);


    const resolvedDirectory = directory
        ? path.join(__dirname, directory)
        : process.cwd();

    const appConfiguration = parseAppConfigurationFile(resolvedDirectory);

    const appName = computeAppName(appConfiguration, resolvedDirectory);


    // query checkAvailableAppName


    // upload files


    // wait for deployment to finish
}


export default deployCommand;
