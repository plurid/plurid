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
            // console.log('enter');
            for (let rootElement of pluridScene.content) {
                // console.log('rootElement', rootElement);
                for (let child of rootElement.children) {
                    if (child.branchId == branchId) {
                        // console.log('child A', child);
                        return child;
                    } else if (child.children != []) {
                        let result = getChild(branchId, child.children);
                        if (result) {
                            return result;
                        }
                    }
                }
            }

            function getChild(branchId, children) {
                for (let child of children) {
                    if (child.branchId == branchId) {
                        // console.log('child B', child);
                        return child;
                    } else if (child.children != []) {
                        let result = getChild(branchId, child.children);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
        }
    }
}).call(this, global)
