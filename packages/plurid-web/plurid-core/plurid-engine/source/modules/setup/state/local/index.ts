// #region imports
    // #region libraries
    import {
        PluridState,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const load = (
    id: string | undefined,
    useLocalStorage: boolean | undefined,
) => {
    if (!useLocalStorage) {
        return;
    }

    try {
        const stateID = id || 'default';

        const stateData = localStorage.getItem('pluridState-' + stateID);

        if (!stateData) {
            return;
        }

        const state: PluridState | undefined = JSON.parse(stateData);

        return state;
    } catch (error) {
        return;
    }
}
// #endregion module



// #region exports
export {
    load,
};
// #endregion exports
