import { setTheme } from '../core/theme';


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
            pushChildrenOfChildren(childrenBranch, rootElement.children);
        } else {
            checkChildren(sheetId, childrenBranch, rootElement.children);
        }
    }

    function pushChildrenOfChildren(childrenBranch, children) {
        for (let child of children) {
            childrenBranch.push(child.branchId);
            pushChildrenOfChildren(childrenBranch, child.children);
        }
    }

    function checkChildren(sheetId, childrenBranch, children) {
        for (let child of children) {
            if (child.sheetId == sheetId) {
                pushChildrenOfChildren(childrenBranch, child.children);
            } else {
                checkChildren(sheetId, childrenBranch, child.children);
            }
        }
    }

    return childrenBranch;
}



/**
 * Set theme
 *
 * @param {string} theme
 */
export function setNewTheme(theme) {
    this.meta.theme = theme;
    setTheme(theme);
}
