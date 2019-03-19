import { setTheme } from '../themes/theme';


/**
 * Gets <plurid-branch> based on branch.id
 *
 * @param {string} branchId
 * @return {Object}
 */
export function getBranchById(branchId: string): any {
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
    function getChild(_branchId: string, children: any[]): any {
        for (const child of children) {
            if (child.branchId === _branchId) {
                return child;
            } else if (child.children !== []) {
                const result = getChild(_branchId, child.children);
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
export function getChildrenBySheetId(sheetId: string): any {
    const childrenBranch: any[] = [];

    for (const rootElement of (<any> window).pluridScene.content) {
        if (rootElement.sheetId === sheetId) {
            pushChildrenOfChildren(childrenBranch, rootElement.children);
        } else {
            checkChildren(sheetId, childrenBranch, rootElement.children);
        }
    }

    function pushChildrenOfChildren(_childrenBranch: any, children: any): any {
        for (const child of children) {
            _childrenBranch.push(child.branchId);
            pushChildrenOfChildren(_childrenBranch, child.children);
        }
    }

    function checkChildren(_sheetId: any, _childrenBranch: any, _children: any): any {
        for (const child of _children) {
            if (child.sheetId === _sheetId) {
                pushChildrenOfChildren(_childrenBranch, child.children);
            } else {
                checkChildren(_sheetId, _childrenBranch, child.children);
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
export function setNewTheme(theme: string): any {
    (<any> window).pluridScene.meta.theme = theme;
    setTheme(theme);
}
