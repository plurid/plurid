// #region imports
    // #region libraries
    import React from 'react';

    import {
        createRoot,
        hydrateRoot,
    } from 'react-dom/client';
    // #endregion libraries


    // #region external
    import {
        APPLICATION_ROOT,
    } from '~shared/data/constants';
    // #endregion external


    // #region internal
    import Client from './Client';
    // #endregion internal
// #endregion imports



// #region module
/** Uncomment to use the service worker caching the static vendor.js and favicons */
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/service-worker.js');
// }

const plurid = document.getElementById(APPLICATION_ROOT)!;


if (
    process.env.PLURID_LIVE_SERVER !== 'true'
) {
    createRoot(
        plurid,
    ).render(
        <Client />,
    );
} else {
    hydrateRoot(
        plurid,
        <Client />,
    );
}
// #endregion module
