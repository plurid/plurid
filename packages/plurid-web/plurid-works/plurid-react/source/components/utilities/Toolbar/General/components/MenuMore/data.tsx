// #region imports
    // #region libraries
    import React from 'react';

    import {
        internationalization,

        TOOLBAR_DRAWERS,

        InternationalizationFieldType,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import MenuMoreGlobal from './components/Global';
    import MenuMoreTransform from './components/Transform';
    import MenuMoreSpace from './components/Space';
    import MenuMoreToolbar from './components/Toolbar';
    import MenuMoreViewcube from './components/Viewcube';
    import MenuMoreTechnical from './components/Technical';
    import MenuMoreShortcuts from './components/Shortcuts';
    // #endregion internal
// #endregion imports



// #region module
export interface MoreMenu {
    name: InternationalizationFieldType;
    drawer: keyof typeof TOOLBAR_DRAWERS,
    component: JSX.Element,
}


export const moreMenusRecord: Record<string, MoreMenu> = {
    GLOBAL: {
        name: internationalization.fields.toolbarDrawerGlobalTitle,
        drawer: TOOLBAR_DRAWERS.GLOBAL,
        component: (<MenuMoreGlobal />),
    },
    TRANSFORM: {
        name: internationalization.fields.toolbarDrawerTransformTitle,
        drawer: TOOLBAR_DRAWERS.TRANSFORM,
        component: (<MenuMoreTransform />),
    },
    SPACE: {
        name: internationalization.fields.toolbarDrawerSpaceTitle,
        drawer: TOOLBAR_DRAWERS.SPACE,
        component: (<MenuMoreSpace />),
    },
    TOOLBAR: {
        name: internationalization.fields.toolbarDrawerToolbarTitle,
        drawer: TOOLBAR_DRAWERS.TOOLBAR,
        component: (<MenuMoreToolbar />),
    },
    VIEWCUBE: {
        name: internationalization.fields.toolbarDrawerViewcubeTitle,
        drawer: TOOLBAR_DRAWERS.VIEWCUBE,
        component: (<MenuMoreViewcube />),
    },
    TECHNICAL: {
        name: internationalization.fields.toolbarDrawerTechnicalTitle,
        drawer: TOOLBAR_DRAWERS.TECHNICAL,
        component: (<MenuMoreTechnical />),
    },
    SHORTCUTS: {
        name: internationalization.fields.toolbarDrawerShortcutsTitle,
        drawer: TOOLBAR_DRAWERS.SHORTCUTS,
        component: (<MenuMoreShortcuts />),
    },
};

export const moreMenus: MoreMenu[] = Object.values(moreMenusRecord);
// #endregion module
