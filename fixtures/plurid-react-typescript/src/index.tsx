import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

// import App from './App-simple-router';
// import App from './App-simple-router-link';
// import App from './App-simple-router-parametric';
// import App from './App-simple-router-config';
// import App from './App-simple';
// import App from './App-simple-link';
// import App from './App-parametric-link';
// import App from './App-transform';
// import App from './App-configurator';
// import App from './App-pubsub-view';
import App from './App-precomputed-state';

import * as serviceWorker from './serviceWorker';



ReactDOM.render(
    <App />,
    document.getElementById('root'),
);


serviceWorker.unregister();
