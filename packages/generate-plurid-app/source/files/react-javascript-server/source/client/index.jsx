import React from 'react';
import ReactDOM from 'react-dom';

import Client from './Client';



/** Uncomment to use the service worker caching the static vendor.js and favicons */
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/service-worker.js');
// }

const pluridApp = document.getElementById('plurid-app');


ReactDOM.hydrate(
    <Client />,
    pluridApp,
);
