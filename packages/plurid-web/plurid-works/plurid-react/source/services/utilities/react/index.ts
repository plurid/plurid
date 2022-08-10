// #region imports
    // #region libraries
    import {
        PluridPlaneComponentProperty,
        PluridRouteComponentProperty,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
        ElementQLComponent,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const isReactRenderable = (
    component: PluridReactComponent<
        any, PluridPlaneComponentProperty | PluridRouteComponentProperty
    > | undefined,
) => {
    if (!component) {
        return false;
    }

    // Check elementql component.
    if (
        typeof component === 'string'
        || (component as ElementQLComponent).url
    ) {
        return false;
    }

    return true;
}
// #endregion module
