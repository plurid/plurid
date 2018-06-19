import { getBranchById } from './scene-core';


// set pluridScene as global variable
(function (global) {
    global.pluridScene = {
        metadata: {
            activePlurid: '',
            activeSheet: '',
            containers: 0,
            rootPages: [],
            rootSheets: [],
            pages: 0,
            transformOrigin: {
                maxPositiveX: 0,
                maxNegativeX: 0,
                maxPositiveY: 0,
                maxNegativeY: 0,
                maxPositiveZ: 0,
                maxNegativeZ: 0,
                transformOriginX: 0,
                transformOriginY: 0,
                transformOriginZ: 0
            }
        },
        content: [],
        getBranchById: getBranchById
    }
}).call(this, global)
