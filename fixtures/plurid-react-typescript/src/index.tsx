import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App-simple-router';

import * as serviceWorker from './serviceWorker';



ReactDOM.render(
    <App />,
    document.getElementById('root'),
);


serviceWorker.unregister();
