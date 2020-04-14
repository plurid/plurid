import {
    PluridComponent,
} from './page';



export interface PluridLink {
    /**
     * The name of the document. If not specified defaults to the current one.
     */
    document?: string;

    /**
     * The path of the page.
     *
     * If IDs are provided to the pages, the id of the page.
     *
     * The page path can:
     *
     * * be a simple string,
     * e.g. `'/path/to/page'` or `'/d71b21673037485a'`,
     * where `d71b21673037485a` is a generated page ID;
     *
     * * be a parametric route,
     * e.g. `'/path/to/:page'`, where `:page` is the parameter value
     * for the parameter defined in the `PluridPage[]`;
     *
     * * receive query `key=value` pairs,
     * e.g. `'/path/to/page?id=1&show=true'`, where `id=1` and `show=true` are `key=value` pairs
     *
     * * specify a text fragment,
     * e.g. `'/path/to/page#:~:text=A%20door,is%20opened.,[0]'`,
     * where the fragment `#:~:text=A%20door,is%20opened.,[0]`
     * is loosely based on the https://github.com/WICG/ScrollToTextFragment specification,
     * and indicates the link to bring into view the first occurence `[0]`, if any,
     * of the text fragment starting with `A door` and ending with `is opened.`.
     *
     * * specify a page element,
     * e.g. `'/path/to/page#:~:element=123,[1]'`,
     * where the fragment `#:~:element=123,[1]`
     * indicates the link to bring into view the second occurence `[1]`, if any,
     * of the element with the attribute `data-plurid-element=123`.
     *
     *
     * ### Larger Syntax Structure
     *
     * The syntax `/page` is used to reference only the plurid pages within the same plurid space.
     *
     * In order to reference pages from other
     *
     * + spaces within the same route,
     * + spaces within other routes,
     * + spaces within other controlled origins,
     * + spaces within other foreign origins,
     *
     * the syntax `://` has to be used.
     *
     *
     * A plurid link in the same space.
     *
     * `://page`
     *
     * example: `://dashboard`
     *
     *
     * A plurid link to a different space within the same route
     *
     * `://space://page`
     *
     * example: `://user123://dashboard`
     *
     *
     * A plurid link to a different space within an another route.
     *
     * `://route://space://page`
     *
     * example: `://payment://user123://dashboard`
     *
     *
     * A plurid link to a different space within a controlled origin.
     *
     * `https://controlled-origin://route://space://page`
     *
     * example: `https://example-c.com://payment://user123://dashboard`
     *
     *
     * A plurid link to a different space within a foreign origin.
     *
     * `https://foreign-origin://route://space://page`
     *
     * example: `https://example-f.com://payment://user123://dashboard`
     *
     */
    page: string;

    /**
     * Format the link as a simple anchor element. Default `false`.
     */
    devisible?: boolean;

    /**
     * String character to be added inline after the PluridLink content. The default is `'`.
     *
     * If `devisible` the suffix is disabled.
     */
    suffix?: string;

    /**
     * Execute function at click (onClick Event).
     */
    atClick?: (event?: MouseEvent | React.MouseEvent) => void;

    /**
     * Show or not the default Not Found component, or pass a custom component
     */
    notFound?: boolean | PluridComponent;

    preview?: boolean;
    previewFadeIn?: number;
    previewFadeOut?: number;
    previewOffsetX?: number;
    previewOffsetY?: number;

    style?: React.CSSProperties;
    className?: string;
}


/**
 * A plurid link in the same space.
 *
 * `://page`
 */
export type PluridLinkIntraspatial = 'intraspatial';

/**
 * A plurid link to a different space within the same route or on another route.
 */
export type PluridLinkInterspatial = 'interspatial';

/**
 * `://space://page`
 */
export type PluridLinkInterspatialSameRoute = 'interspatialSameRoute';

/**
 * `://route://space://page`
 */
export type PluridLinkInterspatialDifferentRoute = 'interspatialDifferentRoute';

export type PluridLinkInterspatialKind =
    | PluridLinkInterspatialSameRoute
    | PluridLinkInterspatialDifferentRoute;



export type PluridLinkOuterspatial = 'outerspatial';

/**
 * `https://controlled-origin://route://space://page`
 */
export type PluridLinkOuterspatialControlledOrigin = 'outerspatialControlledOrigin';

/**
 * `https://foreign-origin://route://space://page`
 */
export type PluridLinkOuterspatialForeignOrigin = 'outerspatialForeignOrigin';

export type PluridLinkOuterspatialKind =
    | PluridLinkOuterspatialControlledOrigin
    | PluridLinkOuterspatialForeignOrigin;
