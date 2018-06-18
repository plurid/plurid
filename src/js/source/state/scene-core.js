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
