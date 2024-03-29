import {
    createRoot,
} from 'react-dom/client';


import './index.css';

// import App from '/apps/App-redesign';

// import App from '/apps/App-simple-router';
// import App from '/apps/App-simple-router-link';
// import App from '/apps/App-simple-router-parametric';
// import App from '/apps/App-simple-router-config';
// import App from './apps/App-simple';
// import App from './apps/App-simple-multiview';
// import App from './apps/App-simple-parametric';
// import App from './apps/App-simple-external-plane';
// import App from './apps/App-simple-link';
import App from './apps/App-simple-pubsub';
// import App from '/apps/App-parametric-link';
// import App from '/apps/App-transform';
// import App from '/apps/App-configurator';
// import App from '/apps/App-pubsub-view';
// import App from '/apps/App-precomputed-state';

import * as serviceWorker from './serviceWorker';



createRoot(
    document.getElementById('root')!,
).render(
    <App />,
);


serviceWorker.unregister();
