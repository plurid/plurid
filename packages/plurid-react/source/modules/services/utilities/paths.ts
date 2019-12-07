import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';



interface Path {
    document: string;
    address: string;
    parameters?: string[];
}

export const registerPaths = (
    indexedDocuments: Indexed<PluridInternalStateDocument>,
) => {
    const paths = [];

    for (let document of Object.values(indexedDocuments)) {
        for (let page of Object.values(document.pages)) {
            const parameters = checkPathForParameters(page.path);

            const path: Path = {
                document: document.id,
                address: page.path,
                parameters,
            };
            paths.push(path);
        }
    }

    return paths;
}


const checkPathForParameters = (
    path: string,
): string[] | undefined => {
    const splitPath = path.split('');

    let settingParamater = false;
    let parameter = '';
    let parameters: string[] = [];
    for (const [index, char] of splitPath.entries()) {
        if (char === ':') {
            if (splitPath[index - 1] && splitPath[index - 1] === '/') {
                settingParamater = true;
                continue;
            }
        }

        if (settingParamater && char !== '/') {
            parameter += char;
            continue;
        }

        if (settingParamater && char === '/') {
            parameters.push(parameter);
        }

        if (char === '/') {
            settingParamater = false;
            parameter = '';
        }
    }

    if (parameters.length > 0) {
        return parameters;
    }

    return undefined;
}
