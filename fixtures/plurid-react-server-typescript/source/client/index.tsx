import React from 'react';
import ReactDOM from 'react-dom';

import Client from './Client';



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}

const pluridApp = document.getElementById('plurid-app');


ReactDOM.hydrate(
    <Client />,
    pluridApp,
);
