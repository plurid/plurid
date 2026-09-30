// #region imports
    // #region libraries
    import {
        Indexed,
        PluridRouteFragments,
        PluridRouteFragmentElement,
        PluridRouteFragmentText,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        ParserParametersAndMatch,
    } from './interfaces';
    // #endregion internal
// #endregion imports



// #region module
/**
 * A percent-encoded piece of a location as text: `caf%C3%A9` is `café`, `john%20doe` is `john doe`.
 * A malformed escape (a bare `%`) is kept as written: `decodeURIComponent` throws on it.
 */
export const decodeLocationPart = (
    value: string,
): string => {
    if (value.indexOf('%') === -1) {
        return value;
    }
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};


export const extractPathname = (
    location: string,
) => {
    if (typeof location !== 'string') {
        return '';
    }

    const queryIndex = location.indexOf('?');
    const noQueryPath = queryIndex === -1
        ? location
        : location.substring(0, queryIndex);

    // any hash — an ordinary anchor (`#details`) as much as a plurid directive (`#:~:text=…`) — is not
    // part of the pathname (`/a#details` matches `/a`)
    const fragmentIndex = noQueryPath.indexOf('#');
    const noFragmentPath = fragmentIndex === -1
        ? noQueryPath
        : noQueryPath.substring(0, fragmentIndex);

    return noFragmentPath;
}


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
export const extractParametersAndMatch = (
    location: string,
    route: string,
): ParserParametersAndMatch => {
    const routeElements = splitPath(route);
    const parameters: string[] = [];

    routeElements.forEach(routeElement => {
        if (routeElement[0] === ':') {
            parameters.push(routeElement);
        } else {
            parameters.push('');
        }
    });

    const {
        locationElements,
    } = computeComparingPath(location, parameters);
    // Element by element, so neither side's leading separator matters: the IsoMatcher slices its
    // own inputs before calling (`routePath.slice(1)`), the Parser hands its route in whole — that
    // mismatch once made EVERY `Parser.extract()` report `match: false` (found 2026-09-13).
    // THE SAME PATH HOWEVER IT IS ENCODED: a literal element matches the route's by what both read
    // as (`caf%C3%A9` is `café`), and compared whole a decoded `a%2Fb` would have read as two.
    const match = locationElements.length === routeElements.length
        && routeElements.every((element, index) => !!parameters[index] || decodeLocationPart(element) === locationElements[index]);
    if (!match) {
        return {
            match: false,
            parameters: {},
            elements: locationElements,
        };
    }

    const parametersValues = extractParametersValues(
        parameters,
        locationElements,
    );
    return {
        match: true,
        parameters: parametersValues,
        elements: locationElements,
    };
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
): Record<string, string> => {
    const parametersValues: Record<string, string> = {};

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
    const pathname = extractPathname(path);
    // the elements as text, however the location encoded them: a parameter is handed over and
    // validated as what it reads as (`john%20doe` is `john doe`, 8 characters, not 10)
    const locationElements = splitPath(pathname).map(decodeLocationPart);
    const comparingPathElements = [...locationElements];

    for (const index of locationElements.keys()) {
        if (parameters[index]) {
            comparingPathElements[index] = parameters[index];
        }
    }

    // const comparingPath = '/' + comparingPathElements.join('/');
    const comparingPath = comparingPathElements.join('/');

    return {
        locationElements,
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
    if (typeof path !== 'string') {
        return {};
    }

    // the query ends at any hash: `/a?x=1#details` is `{ x: '1' }`, not `{ x: '1#details' }` (C06)
    const fragmentIndex = path.indexOf('#');
    const noFragmentPath = fragmentIndex === -1
        ? path
        : path.substring(0, fragmentIndex);
    // and starts at the FIRST `?`: a value may hold another one (`?next=/b?c=1`, `?q=why?`), which
    // a split at every `?` read as no query at all
    const queryIndex = noFragmentPath.indexOf('?');
    if (queryIndex === -1) {
        return {};
    }

    const queryValues: Indexed<string> = {};
    const query = noFragmentPath.slice(queryIndex + 1);

    // `URLSearchParams` decodes safely: it does NOT throw on a bare `%` (the old
    // `decodeURIComponent` did) and a valueless flag (`?debug`) yields `''` rather than
    // the literal string `"undefined"`.
    const params = new URLSearchParams(query);
    for (const [id, value] of params) {
        queryValues[id] = value;
    }

    return queryValues;
}


export const extractFragments = (
    location?: string,
): PluridRouteFragments => {
    if (!location || typeof location !== 'string') {
        return {
            texts: [],
            elements: [],
        };
    }

    const split = location.split('#:~:');
    const fragmentsValues = split[1];

    if (!fragmentsValues) {
        return {
            texts: [],
            elements: [],
        };
    }

    const fragmentItems = fragmentsValues.split('&');

    const textFragments: PluridRouteFragmentText[] = [];
    const elementFragments: PluridRouteFragmentElement[] = [];

    for (const item of fragmentItems) {
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
): PluridRouteFragmentText | PluridRouteFragmentElement | undefined => {
    const separator = fragment.indexOf('=');
    const fragmentType = separator === -1 ? fragment : fragment.slice(0, separator);
    const fragmentValues = separator === -1 ? '' : fragment.slice(separator + 1);
    // a malformed directive (`#:~:text`, `#:~:element=`) is dropped, never thrown (C06)
    if (!fragmentValues) {
        return undefined;
    }

    // The values are split on their delimiters FIRST and decoded after: a text directive encodes a
    // `,` or `&` of its own text, and a location carries the rest encoded too (`hello%20world` is
    // the text `hello world`).
    switch (fragmentType.toLowerCase()) {
        case 'text':
            {
                const textValues = fragmentValues.split(',');
                const textStart = decodeLocationPart(textValues[0]);
                const textEnd = decodeLocationPart(textValues[1] || '');
                const textOccurence = extractOccurence(textValues[2]);

                if (!textStart) {
                    return;
                }

                return {
                    type: 'text',
                    start: textStart,
                    end: textEnd,
                    occurence: textOccurence,
                };
            }
        case 'element':
            {
                const elementValues = fragmentValues.split(',');
                const elementID = decodeLocationPart(elementValues[0]);
                const elementOccurence = extractOccurence(elementValues[1]);

                if (!elementID) {
                    return;
                }

                return {
                    type: 'element',
                    id: elementID,
                    occurence: elementOccurence,
                };
            }
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
// #endregion module
