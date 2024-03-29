// #region imports
    // #region libraries
    import {
        IsoMatcherPlaneResult
    } from '@plurid/plurid-data';

    import {
        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries
// #endregion imports



// #region module
export const resolveElementFromPlaneMatch = (
    planeMatch: IsoMatcherPlaneResult<PluridReactComponent<any>>,
    elementqlEndpoint: string | undefined,
) => {
    if (typeof planeMatch.data.component === 'function') {
        return;
    }

    if (typeof planeMatch.data.component === 'string') {
        return {
            name: planeMatch.data.component,
            url: elementqlEndpoint,
        };
    }

    return {
        name: planeMatch.data.component.name,
        url: planeMatch.data.component.url || elementqlEndpoint,
    };
}
// #endregion module
