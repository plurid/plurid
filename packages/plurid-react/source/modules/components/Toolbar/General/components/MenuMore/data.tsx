import React from 'react';

import {
    TOOLBAR_DRAWERS,
} from '@plurid/plurid-data';

import MenuMoreThemes from './components/Themes';
import MenuMoreTransform from './components/Transform';
import MenuMoreSpace from './components/Space';
import MenuMoreToolbar from './components/Toolbar';
import MenuMoreViewcube from './components/Viewcube';
import MenuMoreTechnical from './components/Technical';
import MenuMoreShortcuts from './components/Shortcuts';



interface MoreMenu {
    name: string;
    drawer: keyof typeof TOOLBAR_DRAWERS,
    component: JSX.Element,
}

export const moreMenus: MoreMenu[] = [
    {
        name: 'themes',
        drawer: TOOLBAR_DRAWERS.THEMES,
        component: (<MenuMoreThemes />),
    },
    {
        name: 'transform',
        drawer: TOOLBAR_DRAWERS.TRANSFORM,
        component: (<MenuMoreTransform />),
    },
    {
        name: 'space',
        drawer: TOOLBAR_DRAWERS.SPACE,
        component: (<MenuMoreSpace />),
    },
    {
        name: 'toolbar',
        drawer: TOOLBAR_DRAWERS.TOOLBAR,
        component: (<MenuMoreToolbar />),
    },
    {
        name: 'viewcube',
        drawer: TOOLBAR_DRAWERS.VIEWCUBE,
        component: (<MenuMoreViewcube />),
    },
    {
        name: 'technical',
        drawer: TOOLBAR_DRAWERS.TECHNICAL,
        component: (<MenuMoreTechnical />),
    },
    {
        name: 'shortcuts',
        drawer: TOOLBAR_DRAWERS.SHORTCUTS,
        component: (<MenuMoreShortcuts />),
    },
];
