export interface PluridView {
    /**
     * Route to a `PluridPlane`.
     *
     * The route can be URL-like, e.g. `'/plane/one?query=true'`,
     * for a plane in the same space, or fully defined,
     * e.g. `'protocol://host://path://space://universe://cluster://plane`.
     */
    plane: string;

    /**
     * By default, the order the planes are shown in is based on their index in the `view[]`.
     * The ordinal can be used to overrule the default order.
     * If not unique, the planes with equal `ordinal` will be ordered by index.
     *
     * 0-based.
     */
    ordinal?: number;
}
