import React from 'react';

import PluridApp from '@plurid/plurid-react';



const Application = () => {
    const pages = [
        {
            path: '/',
            component: {
                element: () => (<div>Plurid' Application</div>),
            },
        },
    ];

    const view = [
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
