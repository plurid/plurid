import {
    PluridComponent,
} from '../component';



export interface PluridLink {
    // /**
    //  * The name of the document. If not specified defaults to the current one.
    //  */
    // document?: string;

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
     * In order to reference
     *
     * + planes within other clusters,
     * + planes within other universes,
     * + planes within other spaces of the same route,
     * + planes within other spaces of a different route,
     * + planes within other spaces of a different, controlled origin,
     * + planes within other spaces of a different, foreign origins,
     *
     * the syntax `://` has to be used.
     *
     *
     * A plurid link in the same space, same universe, same cluster.
     *
     * `://plane`
     *
     * example: `://dashboard`
     *
     *
     * A plurid link to another cluster in the same universe, in the same space.
     *
     * `://cluster://plane`
     *
     * example: `://two://dashboard`
     *
     *
     * A plurid link to another universe in the same space.
     *
     * `://universe://cluster://page`
     *
     * example: `://one://two://dashboard`
     *
     *
     * A plurid link to a different space within the same route
     *
     * `://space://universe://cluster://plane`
     *
     * example: `://user123://dashboard`
     *
     *
     * A plurid link to a different space within an another route.
     *
     * `://route://space://universe://cluster://plane`
     *
     * example: `://payment://user123://dashboard`
     *
     *
     * A plurid link to a different space within a controlled origin.
     *
     * `https://controlled-origin://route://space://universe://cluster://plane`
     *
     * example: `https://example-c.com://payment://user123://dashboard`
     *
     *
     * A plurid link to a different space within a foreign origin.
     *
     * `https://foreign-origin://route://space://universe://cluster://plane`
     *
     * example: `https://example-f.com://payment://user123://dashboard`
     *
     *
     * To handle clusters of clusters use the `|>` syntax, which shows a nesting of clusters,
     * e.g. `://clusterC|>clusterB|>clusterA`,
     * denotes that Cluster C includes Cluster B which includes Cluster A.
     *
     */
    path: string;

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
    previewComponent?: PluridComponent;

    style?: React.CSSProperties;
    className?: string;
}




// /**
//  * A plurid link in the same space, same universe.
//  *
//  * `://page`
//  */
// export type PluridLinkIntraspatial = 'intraspatial';

// /**
//  * `://page`
//  */
// export type PluridLinkIntraspatialSameUniverse = 'intraspatialSameUniverse';

// /**
//  * `://universe://page`
//  */
// export type PluridLinkIntraspatialDifferentUniverse = 'intraspatialDifferentUniverse';



// /**
//  * A plurid link to a different space within the same route or on another route.
//  */
// export type PluridLinkInterspatial = 'interspatial';

// /**
//  * `://space://universe://page`
//  */
// export type PluridLinkInterspatialSameRoute = 'interspatialSameRoute';

// /**
//  * `://route://space://universe://page`
//  */
// export type PluridLinkInterspatialDifferentRoute = 'interspatialDifferentRoute';

// export type PluridLinkInterspatialKind =
//     | PluridLinkInterspatialSameRoute
//     | PluridLinkInterspatialDifferentRoute;



// export type PluridLinkOuterspatial = 'outerspatial';

// /**
//  * `https://controlled-origin://route://space://universe://page`
//  */
// export type PluridLinkOuterspatialControlledOrigin = 'outerspatialControlledOrigin';

// /**
//  * `https://foreign-origin://route://space://universe://page`
//  */
// export type PluridLinkOuterspatialForeignOrigin = 'outerspatialForeignOrigin';

// export type PluridLinkOuterspatialKind =
//     | PluridLinkOuterspatialControlledOrigin
//     | PluridLinkOuterspatialForeignOrigin;
