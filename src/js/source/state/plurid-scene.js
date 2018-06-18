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
            pages: 0
        },
        content: [],
        getBranchById: getBranchById
    }
}).call(this, global)
