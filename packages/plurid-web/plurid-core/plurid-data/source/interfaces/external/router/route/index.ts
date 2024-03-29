// #region imports
    // #region external
    import {
        PluridPartialConfiguration,
    } from '~interfaces/external/configuration';

    import {
        CompareType,
    } from '~interfaces/external/compare';

    import {
        PluridRouteMultispace,
    } from '../multispace';
    // #endregion external
// #endregion imports



// #region module
export type PluridRouteResolver<C> = Omit<PluridRoute<C>, 'value' | 'resolver'>;


/**
 * A route can be `plurid space` or `exterior`-based.
 */
export interface PluridRoute<C, G = any> {
    /**
     * The route `value` can:
     * + be a simple string, e.g. `'/route/to/page'`;
     * + be a parametric location, e.g. `'/route/to/:page'`, where `:page` is the parameter name;
     * + receive query `key=value` pairs,
     * e.g. `'/route/to/page?id=1&show=true'`, where `id=1` and `show=true` are `key=value` pairs;
     */
    value: string;

    parameters?: Record<string, PluridRouteParameter>;

    /**
     * Accepts a component which will be rendered outside of the `spaces`.
     */
    exterior?: C;

    /**
     * A route can have planes and/or spaces.
     */
    planes?: PluridRoutePlane<C>[];

    view?: string[];

    /**
     * A route can have planes and/or spaces.
     */
    spaces?: PluridRouteSpace<C>[];

    /**
     * Pass the rendered `spaces[]` components as a property to the `exterior` component
     * to be rendered in particular slots.
     */
    slotted?: boolean;

    multispace?: PluridRouteMultispace<C>;

    defaultConfiguration?: PluridPartialConfiguration;

    /**
     * Resolve the route at request time.
     *
     * Receives the `globals` from the preserve, if any.
     */
    resolver?: (
        globals: G | undefined,
    ) => PluridRouteResolver<C> | Promise<PluridRouteResolver<C>>;
}



export interface PluridRouteParameter {
    /**
     * Constrain the route parameter to be of a certain length.
     */
    length?: number;

    /**
     * Ensure that the `length` of the route parameter is of a certain type:
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


export interface PluridRouteSpace<C> {
    value: string;

    /**
     * Accepts a component which will be rendered outside of the `space`.
     */
    exterior?: C;

    /**
     * A space can have planes and/or universes.
     */
    planes?: PluridRoutePlane<C>[];

    view?: string[];

    /**
     * A space can have planes and/or universes.
     */
    universes?: PluridRouteUniverse<C>[];

    configuration?: PluridPartialConfiguration;
}


export interface PluridRouteUniverse<C> {
    value: string;

    planes?: PluridRoutePlane<C>[];

    view?: string[];

    /**
     * By default, the order the documents are shown in is based on their index in the `documents[]`.
     * The ordinal can be used to overrule the default order.
     * If not unique, the documents with equal `ordinal` will be ordered by index.
     *
     * 0-based.
     */
    ordinal?: number;

    /**
     * Set the document as active. By default the first document is active.
     *
     * Only one document can be active at a time.
     */
    active?: boolean;
}


export interface PluridRoutePlaneOptions {
    /**
     * Map a direct link for a specific plane.
     *
     * e.g. `/plane-one` will route in browser the path `protocol://host/plane-one`
     *
     * Default composed from route and plane value, `/<route.value/<plane.value>`
     */
    link?: string;

    /**
     * On direct link access (from the browser), show the plane in a `plurid` space,
     * or as the legacy view of an web page.
     *
     * Default `'plurid'`
     */
    linkView?: 'legacy' | 'plurid';

    /**
     * Injectable into other `plurid` spaces.
     *
     * Default `true`
     */
    injectable?: boolean;

    /**
     * Direct access to the plane from the browser.
     *
     * Default plane link composed from route and plane value, `/<route.value/<plane.value>`;
     * changeable through the `link` property.
     *
     * Default `true`
     */
    urlable?: boolean;

    /**
     * Access to the plane through the `gateway` path.
     *
     * Default `true`
     */
    gateable?: boolean;

    /**
     * Render route exterior when directly accessed.
     *
     * Default `true`
     */
    directExterior?: boolean;

    /**
     * Render route exterior when injected into other `plurid` space.
     *
     * Default `false`
     */
    injectExterior?: boolean;

    /**
     * Constraints for the parameters.
     */
    parameters?: Record<string, PluridRouteParameter>;
}

export interface PluridRoutePlaneObject<C> extends PluridRoutePlaneOptions {
    value: string;
    component: C;
}

export type PluridRoutePlaneTuple<C> = [
    /**
     * See `PluridRoutePlaneObject<C>.value`.
     */
    value: string,

    /**
     * See `PluridRoutePlaneObject<C>.component`.
     */
    component: C,

    options?: PluridRoutePlaneOptions,
];

export type PluridRoutePlane<C> =
    | PluridRoutePlaneObject<C>
    | PluridRoutePlaneTuple<C>;
// #endregion module
