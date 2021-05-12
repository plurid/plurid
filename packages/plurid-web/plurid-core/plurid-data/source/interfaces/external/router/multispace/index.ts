// #region module
export type PluridRouteMultispaceAlignment = 'x' | 'y';
export type PluridRouteMultispaceSnapType = 'none' | 'mandatory' | 'proximity';

export interface PluridRouteMultispace<C> {
    /**
     * Default: `y`.
     */
    alignment?: PluridRouteMultispaceAlignment;

    /**
     * Default: `mandatory`.
     */
    snapType?: PluridRouteMultispaceSnapType;

    header?: C;
    footer?: C;
}
// #endregion module
