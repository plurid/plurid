import {
    PluridRouterRouting,
} from '@plurid/plurid-data';

import components from './components';
import routes from './routes';

import {
    ViewType,
} from './view';



const routing: PluridRouterRouting<ViewType> = {
    components,
    routes,
}


export default routing;
