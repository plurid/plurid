import {
    uuid,
} from '@plurid/plurid-functions';

import {
    PluridPage,

    PluridInternalStatePage,
    PluridInternalContextPage,
} from '@plurid/plurid-data';



export const createInternalStatePage = (
    page: PluridPage,
): PluridInternalStatePage => {
    const statePage: PluridInternalStatePage = {
        id: page.id || uuid.generate(),
        path: page.path,
        // root: page.root || false,
        // ordinal: page.ordinal || 0,
    };

    return statePage;
}


export const createInternalContextPage = (
    page: PluridPage,
): PluridInternalContextPage => {
    const contextPage: PluridInternalContextPage = {
        id: page.id || uuid.generate(),
        path: page.path,
        component: page.component,
    };

    return contextPage;
}
