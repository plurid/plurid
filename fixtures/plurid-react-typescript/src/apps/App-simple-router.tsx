import {
    PluridRouterBrowser,
    PluridReactRoute,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';



const App = () => {
    const routes: PluridReactRoute[] = [
        {
            value: '/',
            planes: [
                {
                    value: '/plane',
                    component: Plane1,
                },
            ],
            // view: [
            //     '/plane',
            // ],
        },
        {
            value: '/tupled',
            planes: [
                [
                    '/tuple-plane',
                    Plane1,
                ],
            ],
        },
        {
            value: '/planar',
            exterior: () => (
                <div>
                    planar route
                </div>
            ),
        },
        {
            value: '/not-found',
            planes: [
                {
                    value: '/',
                    component: () => (
                        <div>Not Found</div>
                    ),
                },
            ],
        },
    ];

    return (
        <PluridRouterBrowser
            routes={routes}
        />
    );
}


export default App;
