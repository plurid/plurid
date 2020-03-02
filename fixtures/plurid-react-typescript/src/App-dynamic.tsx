import React, {
    useState,
    useEffect,
} from 'react';

import styled from 'styled-components';

import PluridApp, {
    PluridPage,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import {
    uuidv4 as uuid,
} from '@plurid/plurid-functions';

import Page1 from './containers/Page1';



const oneHundred = [...new Array(1)].map((_, index) => index);

const multiplePages = oneHundred.map((val) => {
    return {
        path: '/' + val,
        // path: '/:id',
        component: {
            element: Page1,
            properties: {
                value: val,
            },
        },
    };
});

const multipleViews = oneHundred.map((val) => {
    return '/' + val;
});


const StyledAdd = styled.div`
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 9999;
    cursor: pointer;
    user-select: none;
`;

const App = () => {
    const [pluridPages, setPluridPages] = useState<PluridPage[]>([]);
    const [pluridView, setPluridView] = useState<string[]>([]);


    const appConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: SPACE_LAYOUT.COLUMNS,
                columns: 8,
                gap: 0.1,
            },
            center: true,
        },
        elements: {
            plane: {
                width: 0.5,
            },
        },
    };


    const addPage = () => {
        const id = uuid();
        const page: PluridPage = {
            id,
            path: '/' + id,
            component: {
                element: Page1,
                properties: {
                    one: 'one',
                },
            },
        };
        const pages = [
            ...pluridPages,
            page,
        ];
        setPluridPages(pages);

        const view = [
            ...pluridView,
            '/' + id,
        ];
        setPluridView(view);
    }


    useEffect(() => {
        setPluridPages(multiplePages);
        setPluridView(multipleViews);
    }, [
        // multiplePages,
        // multipleViews,
    ]);


    return (
        <div>
            <StyledAdd
                onClick={addPage}
            >
                add page
            </StyledAdd>

            <PluridApp
                configuration={appConfiguration}
                pages={pluridPages}
                view={pluridView}
            />
        </div>
    );
}


export default App;
