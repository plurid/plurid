import {
    Indexed,
} from '@plurid/plurid-data';

import {
    Fragments,
    FragmentElement,
    FragmentText,
} from '../Router/interfaces';



/**
 * Extracts the parameters names from a `route`.
 *
 * e.g.
 *
 * `'/:foo/:boo'` -> `[':foo', 'boo']`
 *
 * `'/foo/:boo'` -> `['', 'boo']`
 *
 * `'/foo/boo'` -> `[]`
 *
 * If there are no parameters returns an empty array.
 * Non-parametric route elements have an empty string as placeholder.
 *
 * @param route
 */
export const extractParameters = (
    location: string,
    route: string,
): Indexed<string> => {
    const pathElements = splitPath(route);
    const parameters: string[] = [];

    pathElements.forEach(pathElement => {
        if (pathElement[0] === ':') {
            parameters.push(pathElement);
        } else {
            parameters.push('');
        }
    });

    const noParameters = parameters.every(parameter => parameter === '');
    if (noParameters) {
        // return [];
    }

    // return parameters;
    return {};
}


/**
 * Extract the parameters values.
 *
 * e.g.
 *
 * `parameters = ['', ':list']`
 *
 * `pathElements = ['list', 'foo']`
 *
 * `parametersValues = { list: 'foo' }`
 *
 * @param parameters
 * @param pathElements
 */
export const extractParametersValues = (
    parameters: string[],
    pathElements: string[],
): Indexed<string> => {
    const parametersValues: Indexed<string> = {};

    parameters.forEach(
        (parameter, index) => {
            if (parameter) {
                const parameterKey = parameter.slice(1,);
                parametersValues[parameterKey] = pathElements[index];
            }
        }
    );

    return parametersValues;
}


/**
 * Based on the `path` and the `parameters` computes a match for comparison.
 *
 * @param path
 * @param parameters
 */
export const computeComparingPath = (
    path: string,
    parameters: string[],
) => {
    const pathElements = splitPath(path);
    const comparingPathElements = [...pathElements];

    for (const index of pathElements.keys()) {
        if (parameters[index]) {
            comparingPathElements[index] = parameters[index];
        }
    }

    const comparingPath = '/' + comparingPathElements.join('/');

    return {
        pathElements,
        comparingPath,
    };
}


/**
 * Splits `path` into elements.
 *
 * e.g. `'/foo/boo'` -> `['foo', 'boo']`
 *
 * @param path
 */
export const splitPath = (
    path: string,
) => {
    return path.split('/').filter(i => i !== '');
}


/**
 * Extract the query values.
 *
 * e.g.
 *
 * `path = '/foo?id=1&asd=asd'`
 *
 * `query = { id: 1, asd: 'asd' }`
 *
 * @param path
 */
export const extractQuery = (
    path: string,
): Indexed<string> => {
    const querySplit = path.split('?');

    if (querySplit.length === 2) {
        const queryValues: Indexed<string> = {};
        const query = querySplit[1];
        const queryItems = query.split('&');

        for (const item in queryItems) {
            const queryValue = item.split('=');
            const id = queryValue[0];
            const value = queryValue[1];

            queryValues[id] = value;
        }

        return queryValues;
    } else {
        return {};
    }
}


export const extractFragments = (
    fragments: string,
): Fragments => {
    // text=Foo,Boo,[1]&element=123,[0]

    const fragmentItems = fragments.split('&');

    const textFragments: FragmentText[] = [];
    const elementFragments: FragmentElement[] = [];

    for (const item in fragmentItems) {
        const parsedFragment = parseFragment(item);
        if (parsedFragment) {
            switch (parsedFragment.type) {
                case 'text':
                    textFragments.push(parsedFragment);
                    break;
                case 'element':
                    elementFragments.push(parsedFragment);
                    break;
            }
        }
    }

    return {
        texts: textFragments,
        elements: elementFragments,
    };
}


export const parseFragment = (
    fragment: string,
): FragmentText | FragmentElement | undefined => {
    const fragmentData = fragment.split('=');
    const fragmentType = fragmentData[0];
    const fragmentValues = fragmentData[1];

    switch (fragmentType.toLowerCase()) {
        case 'text':
            // extract text data from
            // e.g.
            // text=Foo,Boo,[0]
            const textValues = fragmentValues.split(',');
            const textStart = textValues[0];
            const textEnd = textValues[1];
            const textOccurence = extractOccurence(textValues[2]);
            return {
                type: 'text',
                start: textStart,
                end: textEnd,
                occurence: textOccurence,
            };
        case 'element':
            // extract element data from
            // e.g.
            // element=123,[0]
            const elementValues = fragmentValues.split(',');
            const elementID = elementValues[0];
            const elementOccurence = extractOccurence(elementValues[1]);
            return {
                type: 'element',
                id: elementID,
                occurence: elementOccurence,
            };
    }

    return undefined;
}


export const extractOccurence = (
    occurence: string | undefined,
): number => {
    if (!occurence) {
        return 0;
    }

    const occurenceMatch = occurence.match(/\[(\d*)\]/);
    const occurenceValue = occurenceMatch
        ? parseInt(occurenceMatch[1])
        : 0;

    return occurenceValue;
}
