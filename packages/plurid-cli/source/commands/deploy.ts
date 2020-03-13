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
import {
    APP_CHECK_AVAILABLE_APP_NAME,
} from '../services/graphql/query';



const authenticateClient = () => {
    const token = store.get('token');
    const refreshToken = store.get('refreshToken');
    const data = {
        token,
        refreshToken,
    };
    const authenticatedClient = authenticationClient(data);

    return authenticatedClient;
}

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

const checkAvailableAppName = async (
    appName: string,
    authenticatedClient: any,
): Promise<string | undefined> => {
    try {
        const input = {
            value: appName,
        };
        const query = await authenticatedClient.query({
            query: APP_CHECK_AVAILABLE_APP_NAME,
            variables: {
                input,
            },
        });

        const response = query.data.appCheckAvailableAppName;
        if (!response.status) {
            return;
        }

        return response.data.value;
    } catch (error) {
        return;
    }
}


const deployCommand = async (
    directory: string | undefined,
) => {
    if (!userLoggedIn()) {
        console.log('\n\tCould not deploy, user not authenticated. Run the \'authenticate\' command.');
        return;
    }

    const authenticatedClient = authenticateClient();


    const resolvedDirectory = directory
        ? path.join(__dirname, directory)
        : process.cwd();


    const appConfiguration = parseAppConfigurationFile(resolvedDirectory);


    const appName = computeAppName(appConfiguration, resolvedDirectory);


    console.log('\n\tChecking application name...');
    const checkedAppName = await checkAvailableAppName(appName, authenticatedClient);
    if (!checkedAppName) {
        console.log('\n\tApp name is invalid or unavailable.');
        return;
    }
    console.log(`\tApplication name ${checkedAppName} is available.`);


    // upload files


    // wait for deployment to finish
}


export default deployCommand;
