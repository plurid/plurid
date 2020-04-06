import React from 'react';
import ReactDOM from 'react-dom';

import Client from './Client';



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}


ReactDOM.hydrate(
    <Client />,
    document.getElementById('plurid-app'),
);
