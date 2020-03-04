import React from 'react';

import {
    PluridSubApp,
    PluridPage,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import {
    StyledNotFound,
} from './styled';

import faces from './faces';

import Head from '../../components/Head';



interface NotFoundProperties {
}

const NotFound: React.FC<NotFoundProperties> = () => {
    /** properties */
    const faceIndex = Math.floor(Math.random() * faces.length);
    const face = faces[faceIndex];

    const pluridConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: SPACE_LAYOUT.COLUMNS,
                columns: 2,
                gap: 0.1,
            },
            center: true,
        },
        elements: {
            plane: {
                controls: {
                    show: false,
                },
                width: 0.5,
            },
        },
    };

    const pluridPages: PluridPage[] = [
        {
            path: '/not-found',
            component: {
                element: () => (
                    <StyledNotFound>
                        <h1>
                            {face}
                        </h1>

                        <p>
                            you searched and it's not here
                        </p>
                    </StyledNotFound>
                ),
                properties: {},
            },
        },
    ];

    const pluridView: PluridView[] = [
        {
            path: '/not-found',
        },
    ];

    return (
        <>
            <Head />

            <PluridSubApp
                configuration={pluridConfiguration}
                pages={pluridPages}
                view={pluridView}
            />
        </>
    );
}


export default NotFound;
