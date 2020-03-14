import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

import FormData from 'form-data';
import yaml from 'js-yaml';
import Zip from 'adm-zip';
import gitIgnore from 'parse-gitignore';

import {
    UPLOAD_HOSTNAME,
    UPLOAD_PORT,
} from '../data/constants';

import store from '../services/store';

import environment from '../services/utilities/environment';

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

const uploadArchive = async (
    appName: string,
    buffer: Buffer,
): Promise<boolean> => {
    try {
        const form = new FormData();
        form.append('archive', buffer, { filename : 'archive.zip' });
        form.append('name', appName);

        const token = store.get('token');
        const refreshToken = store.get('refreshToken');
        const cookies = `token=${token}; refreshToken=${refreshToken}`;

        const options = {
            hostname: UPLOAD_HOSTNAME,
            port: UPLOAD_PORT,
            path: '/app/archive',
            method: 'POST',
            headers: {
                ...form.getHeaders(),
                Cookie: cookies,
            },
        };

        await new Promise((resolve, reject) => {
            const response = (response: http.IncomingMessage) => {
                const {
                    statusCode,
                } = response;
                if (!statusCode) {
                    return reject(false);
                }
                if (statusCode < 200 || statusCode >= 300 ) {
                    return reject(false);
                }

                resolve(true);
            }

            const request = environment.local
                ? http.request(options, response)
                : https.request(options, response);

            request.on('error', (error) => {
                reject(error);
            });
            request.on('end', () => {
                resolve(true);
            });

            form.pipe(request);
        });

        return true;
    } catch (error) {
        return false;
    }
}


const deployCommand = async (
    directory: string | undefined,
) => {
    if (!userLoggedIn()) {
        console.log('\n\tCould not deploy, user not authenticated. Run the \'authenticate\' command:');
        console.log('\n\t\tplurid authenticate\n');
        return;
    }


    const authenticatedClient = authenticateClient();


    const resolvedDirectory = directory
        ? path.join(__dirname, directory)
        : process.cwd();
    console.log('\n\tStarting plurid\' application deployment for:');
    console.log(`\n\t\t${resolvedDirectory}`);


    const appConfiguration = parseAppConfigurationFile(resolvedDirectory);


    const appName = computeAppName(appConfiguration, resolvedDirectory);


    console.log('\n\tChecking application name...');
    const checkedAppName = await checkAvailableAppName(appName, authenticatedClient);
    if (!checkedAppName) {
        console.log(`\n\tApplication name '${appName}' is invalid or unavailable.\n`);
        return;
    }
    console.log(`\tApplication name '${checkedAppName}' is available.`);


    console.log(`\n\tUploading plurid' application files...`);
    const archive = new Zip();

    const banlist = [
        'build',
        'dist',
        'distribution',
        'docs',
        'documentation',
        'node_modules',
    ];

    const gitIgnorePath = path.join(resolvedDirectory, './.gitignore');
    const gitIgnoreData = fs.existsSync(gitIgnorePath)
        ? gitIgnore(fs.readFileSync(gitIgnorePath))
        : [];

    fs.readdirSync(resolvedDirectory).forEach(file => {
        if (!banlist.includes(file) && !gitIgnoreData.includes(file)) {
            const isDirectory = fs.lstatSync(file).isDirectory();
            if (!isDirectory) {
                archive.addLocalFile(path.join(resolvedDirectory, file));
            } else {
                archive.addLocalFolder(path.join(resolvedDirectory, file), file);
            }
        }
    });

    // archive.writeZip(path.join(resolvedDirectory, 'files.zip'));
    const archiveBuffer = archive.toBuffer();

    const uploaded = await uploadArchive(
        checkedAppName,
        archiveBuffer,
    );

    if (!uploaded) {
        console.log(`\n\tApplication files upload failed.\n`);
        return;
    }
    console.log(`\tApplication files uploaded successfully.`);


    // TODO
    // listen for finished deployment
    console.log(`\n\tDeploying plurid' application...`);

    console.log(`\tDeployment finished successfully.`);

    console.log(`\n\tExplore the plurid' application at:`);
    console.log(`\n\t\thttps://${checkedAppName}.plurid.app\n`);
    console.log(`\tand enjoy.\n`);
}


export default deployCommand;
