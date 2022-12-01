// #region imports
    // #region libraries
    import {
        PLURID_ROUTER_LOCATION_CHANGED,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export const pluridRouterNavigate = (
    path: string,
) => {
    if (typeof CustomEvent === 'undefined' || typeof window === 'undefined') {
        return;
    }

    const event = new CustomEvent(
        PLURID_ROUTER_LOCATION_CHANGED,
        {
            detail: {
                path,
            },
        },
    );

    window.dispatchEvent(event);
}
// #endregion module
