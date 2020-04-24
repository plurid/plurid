import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

// import App from './App';
// import App from './App-single';
// import App from './App-dynamic';
// import App from './App-router';
import App from './App-router-app';

import * as serviceWorker from './serviceWorker';



ReactDOM.render(
    <App />,
    document.getElementById('root'),
);

serviceWorker.unregister();
