import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

// import App from './App-simple-router';
// import App from './App-simple-router-link';
// import App from './App-simple-router-parametric';
// import App from './App-simple';
import App from './App-simple-link';

import * as serviceWorker from './serviceWorker';



ReactDOM.render(
    <App />,
    document.getElementById('root'),
);


serviceWorker.unregister();
