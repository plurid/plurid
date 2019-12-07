import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';



interface Path {
    document: string;
    address: string;
    parameters?: Parameter[];
}

interface Parameter {
    name: string;
    index: number;
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
): Parameter[] | undefined => {
    const re = /\/([^\/]+)/g;
    const match = path.match(re);

    if (!match) {
        return undefined;
    }

    const parameters: Parameter[] = [];

    for (const [index, subpath] of match.entries()) {
        if (
            subpath[0] === '/'
            && subpath[1] === ':'
        ) {
            const name = subpath.slice(2,);
            const parameter = {
                name,
                index,
            }
            parameters.push(parameter);
            console.log(subpath);
            console.log(parameter);
        }
    }

    if (parameters.length > 0) {
        return parameters;
    }

    return undefined;


    /** PARSING VERSION */
    // const splitPath = path.split('');

    // let settingParamater = false;
    // let parameter = '';
    // let parameters: string[] = [];
    // for (const [index, char] of splitPath.entries()) {
    //     if (char === ':') {
    //         if (splitPath[index - 1] && splitPath[index - 1] === '/') {
    //             settingParamater = true;
    //             continue;
    //         }
    //     }

    //     if (settingParamater && char !== '/') {
    //         parameter += char;
    //     }

    //     if (settingParamater
    //         && (char === '/' || typeof splitPath[index + 1] === 'undefined')) {
    //         parameters.push(parameter);
    //     }

    //     if (char === '/') {
    //         settingParamater = false;
    //         parameter = '';
    //     }
    // }
}
