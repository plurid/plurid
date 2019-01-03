import { setTheme } from '../themes/theme';


/**
 * Gets <plurid-branch> based on branch.id
 *
 * @param {string} branchId
 * @return {Object}
 */
export function getBranchById(branchId) {
    for (const rootElement of (<any> window).pluridScene.content) {
        for (const child of rootElement.children) {
            if (child.branchId === branchId) {
                return child;
            } else if (child.children !== []) {
                const result = getChild(branchId, child.children);
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
        for (const child of children) {
            if (child.branchId === branchId) {
                return child;
            } else if (child.children !== []) {
                const result = getChild(branchId, child.children);
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
    const childrenBranch = [];

    for (const rootElement of (<any> window).pluridScene.content) {
        if (rootElement.sheetId === sheetId) {
            pushChildrenOfChildren(childrenBranch, rootElement.children);
        } else {
            checkChildren(sheetId, childrenBranch, rootElement.children);
        }
    }

    function pushChildrenOfChildren(childrenBranch, children) {
        for (const child of children) {
            childrenBranch.push(child.branchId);
            pushChildrenOfChildren(childrenBranch, child.children);
        }
    }

    function checkChildren(sheetId, childrenBranch, children) {
        for (const child of children) {
            if (child.sheetId === sheetId) {
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
