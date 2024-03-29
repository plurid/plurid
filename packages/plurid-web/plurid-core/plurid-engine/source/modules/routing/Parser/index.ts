// #region imports
    // #region libraries
    import {
        PluridRoute,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    // import {
    //     Route,
    // } from '../Router/interfaces';
    // #endregion external


    // #region internal
    import {
        ParserOptions,
        ParserPartialOptions,
        ParserResponse,
    } from './interfaces';

    import {
        extractPathname,
        extractParametersAndMatch,
        extractQuery,
        extractFragments,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
export default class Parser<C> {
    /** properties */
    private location: string;
    private path: PluridRoute<C>;
    private options: ParserOptions;


    /** constructor */
    constructor(
        location: string,
        path: PluridRoute<C>,
        options?: ParserPartialOptions,
    ) {
        this.location = location;
        this.path = path;
        this.options = this.handleOptions(options);
    }


    /** private */
    private handleOptions(
        options: ParserPartialOptions | undefined,
    ) {
        const parserOptions: ParserOptions = {
            fragment: options?.fragment || true,
        };

        return parserOptions;
    }

    private extractPathname() {
        const pathname = extractPathname(
            this.location,
        );
        return pathname;
    }

    private extractParametersAndMatch() {
        const parametersAndMatch = extractParametersAndMatch(
            this.location,
            this.path.value,
        );

        return parametersAndMatch;
    }

    private extractQuery() {
        const query = extractQuery(
            this.location,
        );
        return query;
    }

    private extractFragments() {
        const fragments = this.options.fragment
            ? extractFragments(this.location)
            : extractFragments();
        return fragments;
    }


    /** public */
    /**
     * Extract pathname, parameters, query, and fragment, if available.
     */
    public extract() {
        const pathname = this.extractPathname();
        const {
            match,
            parameters,
            elements,
        } = this.extractParametersAndMatch();
        const query = this.extractQuery();
        const queryData = Object
            .entries(query)
            .map(([key, value]) => {
                return key + '=' + value;
            }).join('&');
        const queryString = queryData
            ? '?' + queryData
            : '';
        const fragments = this.extractFragments();

        const parserResponse: ParserResponse<C> = {
            path: this.path,
            pathname,
            elements,
            match,
            parameters,
            query,
            fragments,
            route: pathname + queryString,
        };

        return parserResponse;
    }
}
// #endregion module
