// #region imports
    // #region external
    import {
        Application,
    } from '~data/interfaces';
    // #endregion external


    // #region internal
    import generateReactClientApplication from './client';
    import generateReactServerApplication from './server';
    // #endregion internal
// #endregion imports



// #region module
const generateReactApplication = async (
    app: Application,
) => {
    switch (app.renderer) {
        case 'Client':
            return await generateReactClientApplication(app);
        case 'Server':
            return await generateReactServerApplication(app);
    }
}
// #endregion module



// #region exports
export default generateReactApplication;
// #endregion exports
