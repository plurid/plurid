import React from 'react';

import PluridApp, {
    PluridPage,
} from '@plurid/plurid-react';



const Application = () => {
    const pages: PluridPage[] = [
        {
            path: '/',
            component: {
                element: () => (<div>Plurid' Application</div>),
            },
        },
    ];

    const view: string[] = [
        '/',
    ];

    return (
        <PluridApp
            pages={pages}
            view={view}
        />
    );
}


export default Application;
