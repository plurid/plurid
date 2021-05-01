// #region imports
    // #region libraries
    import {
        PluridRoute,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import Parser from '../Parser';
    // #endregion external


    // #region internal
    import {
        MatcherOptions,
        MatcherPartialOptions,
        MatcherResponse,
    } from './interfaces';

    import {
        checkValidPath,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
export default class Matcher<C> {
    private location: string;
    private path: PluridRoute<C>;
    private options: MatcherOptions;
    private matchedData: MatcherResponse<C> | undefined;


    constructor(
        location: string,
        path: PluridRoute<C>,
        options?: MatcherPartialOptions,
    ) {
        this.location = location;
        this.path = path;
        this.options = this.handleOptions(options);

        this.checkMatch();
    }


    private handleOptions(
        options: MatcherPartialOptions | undefined,
    ) {
        const matcherOptions: MatcherOptions = {
        };
        return matcherOptions;
    }

    private checkMatch() {
        const parsedLocation = new Parser(
            this.location,
            this.path,
        );
        const parserResponse = parsedLocation.extract();

        if (parserResponse.match) {
            const validPath = checkValidPath(
                parserResponse.path.parameters,
                parserResponse.parameters,
            );

            if (validPath) {
                const matcherResponse: MatcherResponse<C> = {
                    ...parserResponse,
                };
                this.matchedData = matcherResponse;
            } else {
                this.matchedData = undefined;
            }
        }
    }


    /**
     * Extract pathname, parameters, query, and fragment, if available.
     */
    public data() {
        return this.matchedData;
    }
}
// #endregion module
