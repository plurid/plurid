import React from 'react';
import {
    createRoot,
} from 'react-dom/client';

import './index.css';

import App from './App';

import * as serviceWorker from './serviceWorker';



const root = createRoot(
    document.getElementById('plurid-app'),
);
root.render(
    <App />,
);

serviceWorker.unregister();
