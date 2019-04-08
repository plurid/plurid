import React from 'react';

import { Route } from './Router';



const PluridRoutingContext = React.createContext({
    registerRoute: (route: Route): void => {/**/},
    routes: {},
});

export default PluridRoutingContext;
