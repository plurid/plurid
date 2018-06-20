/**
 * Gets <plurid-branch> based on branch.id
 *
 * @param {string} branchId
 * @return {Object}
 */
export function getBranchById(branchId) {
    for (let rootElement of pluridScene.content) {
        for (let child of rootElement.children) {
            if (child.branchId == branchId) {
                return child;
            } else if (child.children != []) {
                let result = getChild(branchId, child.children);
                if (result) {
                    return result;
                }
            }
        }
    }

    /**
     * Recursively gets <plurid-branch> within a children array
     * if child.id and branchId match.
     *
     * @param {string} branchId
     * @param {Array} children
     * @return {Object}
     */
    function getChild(branchId, children) {
        for (let child of children) {
            if (child.branchId == branchId) {
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



/**
 * Gets children <plurid-branch> IDs based on sheet.id
 *
 * @param {string} sheetId
 * @return {Array}
 */
export function getChildrenBySheetId(sheetId) {
    let childrenBranch = [];

    for (let rootElement of pluridScene.content) {
        if (rootElement.sheetId == sheetId) {
            for (let child of rootElement.children) {
                childrenBranch.push(child.branchId);
                for (let childs of child.children) {
                    childrenBranch.push(childs.branchId);
                }
            }

        } else {
            for (let child of rootElement.children) {
                if (child.sheetId == sheetId) {
                    for (let childs of child.children) {
                        childrenBranch.push(childs.branchId);
                    }
                }
            }
        }
    }

    return childrenBranch;
}
