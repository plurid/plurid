import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

// import App from './App';
// import App from './App-single';
// import App from './App-dynamic';
import App from './App-router';

import * as serviceWorker from './serviceWorker';



ReactDOM.render(
    <App />,
    document.getElementById('root'),
);

serviceWorker.unregister();
