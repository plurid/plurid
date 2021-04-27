import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

// import App from '/apps/App-redesign';

// import App from '/apps/App-simple-router';
// import App from '/apps/App-simple-router-link';
// import App from '/apps/App-simple-router-parametric';
// import App from '/apps/App-simple-router-config';
// import App from './apps/App-simple';
// import App from './apps/App-simple-multiview';
import App from './apps/App-simple-parametric';
// import App from '/apps/App-simple-link';
// import App from '/apps/App-parametric-link';
// import App from '/apps/App-transform';
// import App from '/apps/App-configurator';
// import App from '/apps/App-pubsub-view';
// import App from '/apps/App-precomputed-state';

import * as serviceWorker from './serviceWorker';



ReactDOM.render(
    <App />,
    document.getElementById('root'),
);


serviceWorker.unregister();
