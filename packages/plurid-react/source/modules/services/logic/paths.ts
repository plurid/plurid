import {
    uuidv4 as uuid,
} from '@plurid/plurid-functions';

import {
    PluridInternalStatePage,

    PagePath,
    PageParameter,
} from '@plurid/plurid-data';



export const registerPaths = (
    pages: PluridInternalStatePage[],
): PagePath[] => {
    const paths: PagePath[] = [];

    for (const page of pages) {
        const handledPath = handlePath(page.path);
        const path: PagePath = {
            id: uuid(),
            pageID: page.id,
            address: page.path,
            // regex: handledPath.regex,
            parameters: handledPath.parameters,
        };
        paths.push(path);
    }

    // for (let document of Object.values(indexedDocuments)) {
    //     for (let page of Object.values(document.pages)) {
    //         const handledPath = handlePath(page.path);

    //         const path: Path = {
    //             document: document.id,
    //             address: page.path,
    //             regex: handledPath.regex,
    //             parameters: handledPath.parameters,
    //         };
    //         paths.push(path);
    //     }
    // }

    return paths;
}


interface PathHandler {
    regex: string;
    parameters?: PageParameter[];
}

const handlePath = (
    path: string,
): PathHandler => {
    return {
        regex: '',
    };

    // const re = /\/([^/]+)/g;
    // const match = path.match(re);

    // if (!match) {
    //     return {
    //         regex: path,
    //     };
    // }

    // const composedRegex = composePathRegex(match);

    // const parameters: PageParameter[] = [];

    // for (const [index, subpath] of match.entries()) {
    //     if (
    //         subpathIsParameter(subpath)
    //     ) {
    //         const name = subpath.slice(2,);
    //         const parameter = {
    //             name,
    //             index,
    //         }
    //         parameters.push(parameter);
    //     }
    // }

    // return {
    //     regex: composedRegex,
    //     parameters: parameters.length > 0 ? parameters : undefined,
    // };


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


export const composePathRegex = (
    match: RegExpMatchArray,
) => {
    let reString = '';

    for (const matched of match) {
        if (!subpathIsParameter(matched)) {
            reString += matched.replace('/', '\\/');
        } else {
            reString += '\\/([^\\/]+)';
        }
    }

    return reString;
}


export const subpathIsParameter = (subpath: string) => {
    return subpath[0] === '/' && subpath[1] === ':';
}
