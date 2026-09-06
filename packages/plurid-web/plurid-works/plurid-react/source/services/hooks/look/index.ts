// #region imports
    // #region libraries
    import {
        Look,
    } from '@plurid/plurid-themes';
    // #endregion libraries

    // #region external
    import {
        getLook,
    } from '~services/look';
    // #endregion external

    // #region internal
    import {
        useEngineSelector,
    } from '../engine';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The look in force — its name, base and tokens — for chrome rendered inside the application (a
 * `render*` slot, a plane's content). The object is identity-stable until the configuration's `look`
 * changes, so it is safe as a dependency.
 */
export const useLook = (): Look => useEngineSelector(getLook);
// #endregion module
