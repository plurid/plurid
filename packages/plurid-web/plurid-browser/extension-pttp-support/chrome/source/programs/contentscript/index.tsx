// #region imports
    // #region libraries
    import React from 'react';

    import ReactDOM from 'react-dom';
    // #endregion libraries


    // #region external
    import {
        chromeStorage,
    } from '../../services/utilities';

    import {
        defaultOptions,
    } from '../../data/constants';
    // #endregion external
// #endregion imports



// #region module
async function contentscript() {
    try {
        const {
            extensionOn,
        } = await chromeStorage.get('extensionOn');

        const {
            options,
        } = await chromeStorage.get('options');

        if (!extensionOn) {
            return;
        }
    } catch (error) {
        return;
    }
}


async function contentscriptMain() {
    await contentscript();
};


contentscriptMain();
// #endregion module
