import PluridApp from './components/core/App';
import PluridContainer from './components/core/Container';
import PluridContent from './components/core/Content';
import PluridControls from './components/core/Controls';
import PluridOptions from './components/core/Options';
import PluridPage from './components/core/Page';
import PluridRoot from './components/core/Root';
import PluridRoots from './components/core/Roots';
import PluridSheet from './components/core/Sheet';
import PluridSpace from './components/core/Space';
import PluridViewcube from './components/core/Viewcube';

import PluridRoute from './components/routing/Route';
import PluridRouter from './components/routing/Router';
import PluridRoutes from './components/routing/Routes';



const Plurid = {
    // components
    App: PluridApp,
    Page: PluridPage,

    // routing
    Route: PluridRoute,
    Router: PluridRouter,
    Routes: PluridRoutes,
}

export default Plurid;

export {
    //
    PluridApp,
    PluridContainer,
    PluridContent,
    PluridControls,
    PluridOptions,
    PluridPage,
    PluridRoot,
    PluridRoots,
    PluridSheet,
    PluridSpace,
    PluridViewcube,

    // routing
    PluridRoute,
    PluridRouter,
    PluridRoutes,
};
