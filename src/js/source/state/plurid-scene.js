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
        getBranchById: (branchId) => {
            for (let rootElement of pluridScene.content) {
                for (let child of rootElement.children) {
                    if (child.branchId == branchId) {
                        return child;
                    } else if (child.children != []) {
                        return getChild(branchId, child.children);
                    }
                }
            }

            function getChild(branchId, children) {
                for (let child of children) {
                    if (child.branchId == branchId) {
                        return child;
                    } else if (child.children != []) {
                        return getChild(branchId, child.children);
                    }
                }
            }
        }
    }
}).call(this, global)
