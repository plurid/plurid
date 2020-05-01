import {
    PluridComponent,
} from '../component';

import {
    CompareType,
} from '../compare';



export interface PluridRouterProperties {
    paths: PluridRouterPath[];

    /**
     * Component to be rendered outside of all the paths and of the global shell.
     */
    globalExterior?: PluridComponent;

    /**
     * Component to wrap around the paths.
     */
    globalShell?: PluridComponent;

    /**
     * Path to navigate to when using clean navigation.
     */
    view?: string;

    /**
     * Navigate without changing the browser URL.
     */
    cleanNavigation?: boolean;

    /**
     * Development default: 'http'.
     * Production default: 'https'.
     */
    protocol?: string;

    /**
     * Development default: `'localhost:3000'`.
     *
     * Production default: `window.location.host`.
     */
    host?: string;

    /**
     * The `gatewayPath` is used to receive external routing requests.
     *
     * e.g.
     *
     * `https://example.com/gateway?plurid=https://subdomain.example.com://path/to/123://s://u://c://a-plane`
     *
     * will route to that specific
     *
     * `host://path://space://universe://cluster://plane`
     */
    gatewayPath?: string;

    /**
     * Component to be rendered on the gateway path, external to the plurid view.
     */
    gatewayExterior?: PluridComponent;

    /**
     * Redirect not found paths to this path.
     * Default: `/not-found`.
     */
    notFoundPath?: string;

    /**
     * API endpoint to request the elements for the paths not found in the initial routing.
     */
    api?: string;
}


/**
 * A routing path can be spaces or exterior-based.
 */
export interface PluridRouterPath {
    /**
     * The path `value` can:
     * + be a simple string, e.g. `'/path/to/page'`;
     * + be a parametric location, e.g. `'/path/to/:page'`, where `:page` is the parameter name;
     * + receive query `key=value` pairs,
     * e.g. `'/path/to/page?id=1&show=true'`, where `id=1` and `show=true` are `key=value` pairs;
     */
    value: string;

    parameters?: Record<string, PluridRouterPathParameter>;

    /**
     * Accepts a component which will be rendered outside of the `spaces`.
     */
    exterior?: PluridComponent;

    /**
     * A path can have planes and/or spaces.
     *
     * Planes will be assigned to the `default` space, `default` universe, `default` cluster.
     */
    planes?: PluridRouterPlane[];

    view?: string[];

    /**
     * A path can have planes and/or spaces.
     */
    spaces?: PluridRouterSpace[];

    /**
     * Pass the rendered `spaces[]` components as a property to the `exterior` component
     * to be rendered in particular slots.
     */
    slotted?: boolean;

    multispace?: PluridRouterPathMultispace;
}


export interface PluridRouterPathParameter {
    /**
     * Constrain the path parameter to be of a certain length.
     */
    length?: number;

    /**
     * Ensure that the `length` of the path is of a certain type:
     *
     * * `'=='`     - equal,
     * * `'<='`     - equal or less than,
     * * `'<'`      - less than,
     * * `'>='`     - equal or greater than,
     * * `'>'`      - greater than.
     *
     * Default `'<='`, if a `length` is provided.
     */
    lengthType?: CompareType;

    startsWith?: string;
    endsWith?: string;

    includes?: string[];
}


export interface PluridRouterSpace {
    value: string;

    /**
     * Accepts a component which will be rendered outside of the `space`.
     */
    exterior?: PluridComponent;

    /**
     * A space can have planes and/or universes.
     *
     * Planes will be assigned to the `default` universe, `default` cluster.
     */
    planes?: PluridRouterPlane[];

    view?: string[];

    /**
     * A space can have planes and/or universes.
     */
    universes?: PluridRouterUniverse[];
}


export interface PluridRouterUniverse {
    value: string;

    /**
     * An universe can have planes and/or clusters.
     *
     * Planes will be assigned to the `default` cluster.
     */
    planes?: PluridRouterPlane[];

    clusters?: PluridRouterCluster[];
}


export interface PluridRouterCluster {
    value: string;
    planes: PluridRouterPlane[];
}


export interface PluridRouterPlane {
    component: PluridComponent;
    value: string;
}


export interface PluridRouterPathMultispace {
    /**
     * Default: `y`.
     */
    alignment?: 'x' | 'y';

    /**
     * Default: `mandatory`.
     */
    snapType?: 'none' | 'mandatory' | 'proximity';
}



// export interface PluridRouter {
//     hosts: PluridRouterHost[];
// }

// export interface PluridRouterHost {
//     protocol: string;
//     host: string;
//     paths: PluridRouterPath[];
// }



// export interface PluridRouterRoute<T> {
//     /**
//      * The `path` can:
//      *
//      * * be a simple string,
//      * e.g. `'/path/to/page'`;
//      *
//      * * be a parametric location,
//      * e.g. `'/path/to/:page'`, where `:page` is the parameter name;
//      *
//      * * receive query `key=value` pairs,
//      * e.g. `'/path/to/page?id=1&show=true'`, where `id=1` and `show=true` are `key=value` pairs;
//      *
//      * * specify a text fragment,
//      * e.g. `'/path/to/page#:~:text=A%20door,is%20opened.,[0]'`,
//      * where the fragment `#:~:text=A%20door,is%20opened.,[0]`
//      * is loosely based on the https://github.com/WICG/ScrollToTextFragment specification,
//      * and indicates the link to bring into view the first occurence `[0]`, if any,
//      * of the text fragment starting with `A door` and ending with `is opened.`;
//      *
//      * * specify a page element,
//      * e.g. `'/path/to/page#:~:element=123,[1]'`,
//      * where the fragment `#:~:element=123,[1]`
//      * indicates the link to bring into view the second occurence `[1]`, if any,
//      * of the element with the attribute `data-plurid-element=123`;
//      *
//      * The text fragment and page element work only for plurid' pages
//      * and not directly from the browser's URL bar.
//      */
//     path: string;

//     /**
//      * The view is a string, usually ALL_CAPS,
//      * indicating the global container to be used by the router
//      * at render time if it's a positive match.
//      */
//     view: T;

    // /**
    //  * Constrain the path to be of a certain length.
    //  * Generally, useful for parametric paths.
    //  *
    //  * The length refers to the length of the pathname,
    //  * and doesn't take into consideration query, or fragments.
    //  *
    //  * If a `Indexed<number>` type is used,
    //  * then the index must be the parameter name.
    //  */
    // length?: number | Indexed<number>;

    // /**
    //  * Ensure that the `length` of the path is of a certain type:
    //  *
    //  * * `'=='`     - equal,
    //  * * `'<='`     - equal or less than,
    //  * * `'<'`      - less than,
    //  * * `'>='`     - equal or greater than,
    //  * * `'>'`      - greater than.
    //  *
    //  * Default `'<='`, if a `length` is provided.
    //  *
    //  * If a `Indexed<CompareType>` type is used,
    //  * then the index must be the parameter name.
    //  */
    // lengthType?: CompareType | Indexed<CompareType>;
// }
