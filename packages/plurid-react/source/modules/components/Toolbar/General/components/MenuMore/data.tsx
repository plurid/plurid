import React from 'react';

import {
    internationalization,

    TOOLBAR_DRAWERS,

    InternationalizationFieldType,
} from '@plurid/plurid-data';


import MenuMoreThemes from './components/Themes';
import MenuMoreTransform from './components/Transform';
import MenuMoreSpace from './components/Space';
import MenuMoreToolbar from './components/Toolbar';
import MenuMoreViewcube from './components/Viewcube';
import MenuMoreTechnical from './components/Technical';
import MenuMoreShortcuts from './components/Shortcuts';



interface MoreMenu {
    name: InternationalizationFieldType;
    drawer: keyof typeof TOOLBAR_DRAWERS,
    component: JSX.Element,
}

export const moreMenus: MoreMenu[] = [
    {
        name: internationalization.fields.toolbarDrawerThemesTitle,
        drawer: TOOLBAR_DRAWERS.THEMES,
        component: (<MenuMoreThemes />),
    },
    {
        name: internationalization.fields.toolbarDrawerTransformTitle,
        drawer: TOOLBAR_DRAWERS.TRANSFORM,
        component: (<MenuMoreTransform />),
    },
    {
        name: internationalization.fields.toolbarDrawerSpaceTitle,
        drawer: TOOLBAR_DRAWERS.SPACE,
        component: (<MenuMoreSpace />),
    },
    {
        name: internationalization.fields.toolbarDrawerToolbarTitle,
        drawer: TOOLBAR_DRAWERS.TOOLBAR,
        component: (<MenuMoreToolbar />),
    },
    {
        name: internationalization.fields.toolbarDrawerViewcubeTitle,
        drawer: TOOLBAR_DRAWERS.VIEWCUBE,
        component: (<MenuMoreViewcube />),
    },
    {
        name: internationalization.fields.toolbarDrawerTechnicalTitle,
        drawer: TOOLBAR_DRAWERS.TECHNICAL,
        component: (<MenuMoreTechnical />),
    },
    {
        name: internationalization.fields.toolbarDrawerShortcutsTitle,
        drawer: TOOLBAR_DRAWERS.SHORTCUTS,
        component: (<MenuMoreShortcuts />),
    },
];
