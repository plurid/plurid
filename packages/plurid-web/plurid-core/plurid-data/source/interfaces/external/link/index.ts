// #region module
export interface PluridLink<C, S, M> {
    /**
     * The route of the plane.
     *
     * If IDs are provided to the planes, the id of the plane.
     *
     * The route path can:
     *
     * * be a simple string,
     * e.g. `'/route/to/plane'` or `'/d71b21673037485a'`,
     * where `d71b21673037485a` is a generated plane ID;
     *
     * * be a parametric route,
     * e.g. `'/route/to/:plane'`, where `:plane` is the parameter value
     * for the parameter defined in the `PluridPage[]`;
     *
     * * receive query `key=value` pairs,
     * e.g. `'/route/to/plane?id=1&show=true'`, where `id=1` and `show=true` are `key=value` pairs
     *
     * * specify a text fragment,
     * e.g. `'/route/to/plane#:~:text=A%20door,is%20opened.,[0]'`,
     * where the fragment `#:~:text=A%20door,is%20opened.,[0]`
     * is loosely based on the https://github.com/WICG/ScrollToTextFragment specification,
     * and indicates the link to bring into view the first occurence `[0]`, if any,
     * of the text fragment starting with `A door` and ending with `is opened.`.
     *
     * * specify a page element,
     * e.g. `'/route/to/plane#:~:element=123,[1]'`,
     * where the fragment `#:~:element=123,[1]`
     * indicates the link to bring into view the second occurence `[1]`, if any,
     * of the element with the attribute `data-plurid-element=123`.
     *
     *
     * ### Larger Syntax Structure
     *
     * The syntax `/plane` is used to reference only the plurid planes within the same plurid space.
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
    route: string;

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
    atClick?: (event?: MouseEvent | M) => void;

    /**
     * Show or not the default Not Found component, or pass a custom component
     */
    notFound?: boolean | C;

    preview?: boolean;
    previewFadeIn?: number;
    previewFadeOut?: number;
    previewOffsetX?: number;
    previewOffsetY?: number;
    previewComponent?: C;

    style?: S;
    className?: string;
}
// #endregion module
