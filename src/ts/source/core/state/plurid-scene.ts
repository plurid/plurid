import { getBranchById,
         getChildrenBySheetId,
         setNewTheme } from './scene-core';



declare var global: any;

// set pluridScene as global variable
((_global: any) => {
    _global.pluridScene = {
        meta: {
            activePlurid: '',
            activeSheet: '',
            containers: 0,
            ground: 0,
            multiPageGap: 50,
            pages: 0,
            previousActiveSheet: '',
            reflections: false,
            rootPages: [],
            rootSheets: [],
            shadows: false,
            theme: 'dusk',
            themes: ['night', 'dusk', 'dawn', 'light'],
            transformOrigin: {
                maxPositiveX: 0,
                maxNegativeX: 0,
                maxPositiveY: 0,
                maxNegativeY: 0,
                maxPositiveZ: 0,
                maxNegativeZ: 0,
                transformOriginX: 0,
                transformOriginY: 0,
                transformOriginZ: 0,
            },
        },
        content: [],
        getBranchById,
        getChildrenBySheetId,
        setTheme: setNewTheme,
    };
}).call(<any> this, (<any> global));
