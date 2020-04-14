export interface PluridView {
    /**
     * Path to a `PluridPage`.
     *
     * The path can be URL-like, e.g. `'/page/one?query=true'`, or the page id.
     */
    path: string;

    /**
     * By default, the order the pages are shown in is based on their index in the `view[]`.
     * The ordinal can be used to overrule the default order.
     * If not unique, the pages with equal `ordinal` will be ordered by index.
     *
     * 0-based.
     */
    ordinal?: number;
}
