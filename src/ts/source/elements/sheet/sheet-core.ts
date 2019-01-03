import * as transcore from "../../core/logic/transforms-core";
import { setShadows } from '../../core/logic/shadows';
import { setReflections } from '../../core/logic/reflections';
import { setId } from "../../core/utils/complex";



/**
 * Inserts newNode after the referenceNode.
 *
 * @param {HTMLElement} newNode
 * @param {HTMLElement} referenceNode
 */
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


/**
 * Checks recursively if the parents of the given pluridElement
 * have the nodeName 'PLURID-PAGE'.
 *
 * @param {object} pluridElement            Given <plurid-page> element.
 * @return {boolean}                        True if pluridElement should be a <plurid-root>.
 */
function checkPluridParent(pluridElement) {
    if (pluridElement.nodeName !== 'HTML') {
        if (pluridElement.parentElement.nodeName === 'PLURID-PAGE') {
            // console.log('is NOT a plurid root');
            return false;
        } else {
            return checkPluridParent(pluridElement.parentElement);
        }
    } else {
        // console.log('is a plurid-root');
        return true;
    }
}


/**
 * Checks recursively if the parents of the given pluridElement
 * are the specifiedParent.
 *
 * @param {string} specifiedParent          HTMLElement.nodeName for a parent of the pluridElement.
 * @param {HTMLElement} pluridElement       plurid HTMLElement.
 * @return {HTMLElement}                    The specified parent element.
 */
export function getSpecifiedParent(pluridElement, specifiedParent) {
    if (pluridElement.nodeName !== 'HTML') {
        if (pluridElement.parentElement.nodeName === specifiedParent) {
            return pluridElement.parentElement;
        } else {
            return getSpecifiedParent(pluridElement.parentElement, specifiedParent);
        }
    }
}


/**
 * Search recursively for children of children,
 * check if id matches,
 * push the sceneObject where it matches.
 *
 * @param {Array} childrenArray
 * @param {Object} sceneObject
 */
function pushChildren(childrenArray, sceneObject) {
    for (const child of childrenArray) {
        if (child.branchId === sceneObject.linkParentId) {
            child.children.push(sceneObject);
        } else {
            pushChildren(child.children, sceneObject);
        }
    }
}



/**
 * Sends the XHR request given on the pluridLink page/href,
 * creates the plurid structure from the response,
 * renders the plurid element
 *
 *
 * @param {HTMLElement} pluridLink       plurid HTMLElement.
 */
function setPluridLinks(pluridLink) {
    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.responseText, "text/html");

            const newBranch = document.createElement("plurid-branch");
            newBranch.innerHTML = `
                                    <plurid-bridge></plurid-bridge>

                                    <plurid-scion>
                                        <plurid-sheet>
                                            <plurid-content>
                                                ${doc.body.innerHTML}
                                                </plurid-content>
                                        </plurid-sheet>
                                    </plurid-scion>
                                `;
            (<any> newBranch).link = pluridLink.id;
            setId(newBranch, 'branch');


            const right = pluridLink.offsetLeft + pluridLink.offsetWidth;
            const top = pluridLink.offsetTop;
            // console.log('pluridLink right -- X', right);
            // console.log('pluridLink top ---- Y', top);

            const pluridRoot = getSpecifiedParent(pluridLink, 'PLURID-ROOT');
            const pluridSheet = getSpecifiedParent(pluridLink, 'PLURID-SHEET');
            const pluridBranch = getSpecifiedParent(pluridLink, 'PLURID-BRANCH');
            // console.log('link', pluridLink);
            // console.log('root', pluridRoot);
            // console.log('sheet', pluridSheet);
            // console.log('branch', pluridBranch);

            const angleDeg = 90;
            let angleBranch;
            let branchBridge;
            let bridgeWidth;
            if (pluridBranch) {
                angleBranch = transcore.getTransformRotate(pluridBranch).rotateY;
                angleBranch = angleBranch * 180 / Math.PI;
                branchBridge = pluridBranch.children[0];
                bridgeWidth = parseInt(branchBridge.style.width, 0) || 100;
            }
            // console.log(angleBranch);

            const linkParentId = pluridBranch ? pluridBranch.id : pluridSheet.id;
            // console.log(linkParentId, 'is the parent of', newBranch.id);
            const parentBranch = (<any> window).pluridScene.getBranchById(linkParentId);
            // console.log('the parentBranch is ', parentBranch);

            // console.log(bridgeWidth);
            const bridgeLength = bridgeWidth || 100;

            let parentAngleY = parentBranch ? parentBranch.coordinates.angleY : 0;
            // console.log('parentAngleY % 360', parentAngleY % 360)
            parentAngleY = parentAngleY % 360;
            // console.log('parentAngleY', parentAngleY)

            const quadrant = getQuadrant(parentAngleY);
            const quadrantCoefficients = getQuadrantCoefficients(quadrant);
            const quadrantCoefX = quadrantCoefficients.X;
            const quadrantCoefZ = quadrantCoefficients.Z;

            // console.log('parent quadrant', quadrant);
            // console.log('quadrantCoefX', quadrantCoefX);
            // console.log('quadrantCoefZ', quadrantCoefZ);

            const rotXbranch = angleDeg;

            let prevLinkX;
            let prevLinkY;
            let prevTransX;
            let prevTransY;
            let prevTransZ;

            if (parentBranch) {
                // console.log('parentBranch', parentBranch);
                prevLinkX = parentBranch.coordinates.linkX;
                prevLinkY = parentBranch.coordinates.linkY;
                prevTransX = parentBranch.coordinates.transX;
                prevTransY = parentBranch.coordinates.transY ? parentBranch.coordinates.transY : parentBranch.coordinates.linkY;
                prevTransZ = parentBranch.coordinates.transZ;
            }


            const clickTransX = right;
            const clickTransY = top;

            // console.log('prevTransX', prevTransX);
            // console.log('prevTransY', prevTransY);
            // console.log('prevTransZ', prevTransZ);
            // console.log('clickTransX', clickTransX);
            // console.log('clickTransY', clickTransY);


            const path = generatePath(newBranch.id, linkParentId);
            // console.log('path', path);

            const translationData = {
                prevLinkX,
                prevLinkY,
                prevTransX,
                prevTransY,
                prevTransZ,
                clickTransX,
                clickTransY,
                bridgeLength,
                quadrant,
                quadrantCoefX,
                quadrantCoefZ,
                rotXbranch,
                path,
            };

            const translations = getTranslations(translationData);
            const transX = translations.X;
            const transY = translations.Y;
            const transZ = translations.Z;
            // console.log('transX', transX);
            // console.log('transY', transY);
            // console.log('transZ', transZ);
            // console.log('-----');

            if (angleBranch !== undefined) {
                angleBranch = angleBranch + 90;
                newBranch.style.transform = `translateX(${transX}px) translateY(${transY}px) translateZ(${transZ}px) rotateX(0deg) rotateY(${angleBranch}deg) rotateZ(0deg) scale(1)`;
            } else {
                newBranch.style.transform = `translateX(${right}px) translateY(${top}px) translateZ(0px) rotateX(0deg) rotateY(${angleDeg}deg) rotateZ(0deg) scale(1)`;
            }

            const lastChild = pluridRoot.lastChild;

            insertAfter(newBranch, lastChild);

            const angleRotY = angleBranch ? angleBranch : angleDeg;
            const branchSheet = newBranch.getElementsByTagName('plurid-sheet')[0];


            // let pluridShadow = document.createElement('plurid-shadow');

            // lastChild = pluridRoot.lastChild;
            // insertAfter(pluridShadow, lastChild);

            // pluridShadow.sheet = branchSheet.id;
            // // console.log('--------');
            // // console.log(branchSheet.offsetHeight);

            const computedShadowHeight = 500;
            // pluridShadow.style.height = computedShadowHeight + "px";

            const branchSheetHeight = (<any> branchSheet).offsetHeight;
            const branchSheetWidth = (<any> branchSheet).offsetWidth;
            // // console.log('branchSheetWidth', branchSheetWidth);
            // pluridShadow.style.width = branchSheetWidth + "px";

            const ground = (<any> window).pluridScene.meta.ground;
            // console.log(ground);

            // if (branchSheetHeight > ground) {
            //     pluridScene.meta.ground = branchSheetHeight - computedShadowHeight;
            //     ground = pluridScene.meta.ground;
            // }
            // pluridShadow.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(90deg) rotateY(0deg) rotateZ(90deg) scale(1) skew(0deg)`;

            const reflectionY = transY ? transY : top;

            const reflections = (<any> window).pluridScene.meta.reflections;
            if (reflections === true) {
                setReflections(branchSheet, branchSheetHeight, ground, reflectionY);
            }


            const sceneObject = {
                linkParentId,
                link: (<any> newBranch).link,
                branchId: newBranch.id,
                sheetId: branchSheet.id,
                coordinates: {
                    prevLinkX,
                    prevLinkY,
                    linkX: right,
                    linkY: top,
                    prevTransX,
                    prevTransY,
                    prevTransZ,
                    transX,
                    transY,
                    transZ,
                    angleY: angleRotY,
                },
                children: [],
                path,
            };

            for (const rootScene of (<any> window).pluridScene.content) {
                if (rootScene.id === pluridRoot.id) {
                    if (sceneObject.linkParentId.includes('branch')) {
                        pushChildren(rootScene.children, sceneObject);
                    } else {
                        rootScene.children.push(sceneObject);
                    }
                }
            }
        }
    };

    let href = '';
    if (pluridLink.page) {
        href = pluridLink.page;
    } else {
        href = pluridLink.href;
    }

    xhttp.open("GET", href, true);
    xhttp.setRequestHeader("Cache-Control", "no-cache");
    xhttp.setRequestHeader("Pragma", "no-cache");
    xhttp.send();
}


/**
 * For all the anchorTags <a> and pluridLinks <plurid-link>
 * adds event listeners on click to generate the plurid structure.
 */
export function setLink(pluridPage) {
    const pluridPageId = pluridPage.id;
    const pageAnchorTags = document.querySelectorAll(`#${pluridPageId} a`);
    const pagePluridLinks = document.querySelectorAll(`#${pluridPageId} plurid-link`);

    for (const anchorTag of pageAnchorTags) {
        anchorTag.addEventListener('click', (event) => {
            event.preventDefault();

            if (!checkBranchExistence(anchorTag.id)) {
                setPluridLinks(anchorTag);
            } else {
                // TODO
                // translate into view of the new plurid-branch
                // console.log('anchorTag already set');
            }
        });
    }

    for (const pluridLink of pagePluridLinks) {
        pluridLink.addEventListener('click', () => {
            if (!checkBranchExistence(pluridLink.id)) {
                setPluridLinks(pluridLink);
            } else {
                // TODO
                // translate into view of the new plurid-branch
                // console.log('pluridLink already set');
            }
        });
    }
}


/**
 * Checks recursively if the parents of the given pluridElement
 * are the specifiedParent.
 *
 * @param {string} specifiedParent          HTMLElement.nodeName for a parent of the pluridElement.
 * @param {HTMLElement} pluridElement       plurid HTMLElement.
 * @return {HTMLElement}                    The specified parent element.
 */
function checkBranchExistence(linkId) {
    const branches = document.getElementsByTagName('plurid-branch');
    let count = 0;

    for (const branch of branches) {
        if ((<any> branch).link === linkId) {
            count++;
            if (count >= 1) {
                return true;
            }
        }
    }

    return false;
}


/**
 * Sets the id on all the <a> anchor tags within a certain <plurid-sheet>
 *
 * @param {string} sheetId          Id of a <plurid-sheet>
 */
export function setAnchorTagsId(sheetId) {
    const pageAnchorTags = document.querySelectorAll(`#${sheetId} a`);

    for (const anchorTag of pageAnchorTags) {
        setId(anchorTag, 'anchor');
    }
}


/**
 * Pushes the current <plurid-sheet> to pluridScene global
 * if element is direct child of <plurid-root>.
 *
 * @param {HTMLElement} pluridSheet
 */
export function setPluridRoots(pluridSheet) {
    if (pluridSheet.parentElement.nodeName === 'PLURID-ROOT') {
        const sheet = {
            id: pluridSheet.parentElement.id,
            sheetId: pluridSheet.id,
            meta: [],
            children: [],
        };

        (<any> window).pluridScene.meta.rootSheets.push(pluridSheet.id);
        (<any> window).pluridScene.content.push(sheet);
    }
}


/**
 * Based on angle returns the specific quadrant.
 *
 * @param {number} angle        Angle value between 0 and 360 degrees.
 * @return {string}
 */
function getQuadrant(angle) {
    let quadrant;

    if (angle >= 0 && angle <= 90) {
        return quadrant = 'quadrantA';
    }
    if (angle > 90 && angle <= 180) {
        return quadrant = 'quadrantB';
    }
    if (angle > 180 && angle <= 270) {
        return quadrant = 'quadrantC';
    }
    if (angle > 270 && angle <= 360) {
        return quadrant = 'quadrantD';
    }
}


/**
 * Based on quadrant returns the specific quadrant coefficients.
 *
 * @param {string} quadrant
 * @return {object}
 */
function getQuadrantCoefficients(quadrant) {
    let quadrantCoefficientX;
    let quadrantCoefficientZ;

    switch (quadrant) {
        case 'quadrantA':
            quadrantCoefficientX = 1;
            quadrantCoefficientZ = -1;
            break;
        case 'quadrantB':
            quadrantCoefficientX = 1;
            quadrantCoefficientZ = -1;
            break;
        case 'quadrantC':
            quadrantCoefficientX = 1;
            quadrantCoefficientZ = -1;
            break;
        case 'quadrantD':
            quadrantCoefficientX = 1;
            quadrantCoefficientZ = -1;
            break;
    }

    return {
        X: quadrantCoefficientX,
        Z: quadrantCoefficientZ,
    };
}


/**
 * Based on the parent branch with the linkParentId
 * of the branch with currentId, obtain the path
 * to the current branch.
 *
 * @param {string} currentId
 * @param {string} linkParentId
 * @return {Array}
 */
function generatePath(currentId, linkParentId) {
    const parent = (<any> window).pluridScene.getBranchById(linkParentId);
    if (parent) {
        const path = [];

        const parentPath = parent.path;
        for (const pathElement of parentPath) {
            const pluridElement = (<any> window).pluridScene.getBranchById(pathElement);
            if (pluridElement.linkParentId !== linkParentId) {
                path.push(pathElement);
            }
        }

        path.push(currentId);
        return path;
    } else {
        return [currentId];
    }
}


/**
 * Calculate translations based on the translationData
 *
 * @param {Object} translationData
 * @return {Object}
 */
function getTranslations(translationData) {
    const prevLinkX = translationData.prevLinkX;
    const prevLinkY = translationData.prevLinkY;
    const prevTransX = translationData.prevTransX;
    const prevTransY = translationData.prevTransY;
    const prevTransZ = translationData.prevTransZ;
    const clickTransX = translationData.clickTransX;
    const clickTransY = translationData.clickTransY;
    const bridgeLength = translationData.bridgeLength;
    const quadrant = translationData.quadrant;
    const quadrantCoefX = translationData.quadrantCoefX;
    const quadrantCoefZ = translationData.quadrantCoefZ;
    const rotXbranch = translationData.rotXbranch;
    const path = translationData.path;

    let penultimateRoot;
    let penultimateRootTransX;
    let penultimateRootTransZ;
    let penultimateRootAngleY;
    let penultimateRootAngleYRad;
    const penultimate = path.length - 2;

    let transX;
    let transY;
    let transZ;

    if (penultimate > 0) {
        penultimateRoot = (<any> window).pluridScene.getBranchById(path[penultimate]);
        penultimateRootAngleY = penultimateRoot.coordinates.angleY;
        // console.log(penultimateRootAngleY);
        penultimateRootAngleYRad = penultimateRootAngleY * Math.PI / 180;
        penultimateRootTransX = penultimateRoot.coordinates.transX;
        penultimateRootTransZ = penultimateRoot.coordinates.transZ;
    }


    if (path.length === 2) {
        transX = quadrantCoefX * (prevLinkX + (clickTransX + bridgeLength) * Math.cos(rotXbranch * Math.PI / 180))
        transZ = quadrantCoefZ * (clickTransX + bridgeLength) * Math.sin(rotXbranch * Math.PI / 180);
        // console.log('PATH LENGTH', path.length);
    }

    if (path.length > 2) {
        transX = prevTransX + Math.cos(penultimateRootAngleYRad) * (clickTransX + bridgeLength);
        transZ = prevTransZ - Math.sin(penultimateRootAngleYRad) * (clickTransX + bridgeLength);
        // console.log('PATH LENGTH', path.length);
    }

    transY = prevTransY + clickTransY;

    return {
        X: transX,
        Y: transY,
        Z: transZ,
    };
}


/**
 * Sets eventListener on window to detect active sheet.
 */
function setActiveSheetListener() {
    window.addEventListener('click', (event) => {
        // cross-browsers eventPath
        const eventPath = (<any> event).path || (event.composedPath && event.composedPath());

        setActiveSheet(eventPath);
    });
}
setActiveSheetListener();

/**
 * Set active sheet logic
 */
function setActiveSheet(eventPath) {
    const activeSheet = (<any> window).pluridScene.meta.activeSheet;
    const currentSheet = checkSheet(eventPath);
    if (currentSheet) {
        if (currentSheet !== activeSheet) {
            (<any> window).pluridScene.meta.previousActiveSheet = (<any> window).pluridScene.meta.activeSheet;
            (<any> window).pluridScene.meta.activeSheet = currentSheet;

            removeActiveSheetShadow((<any> window).pluridScene.meta.previousActiveSheet, 'plurid-sheet-active-transform');
            removeActiveSheetShadow((<any> window).pluridScene.meta.previousActiveSheet, 'plurid-sheet-active');
            addActiveSheetShadow((<any> window).pluridScene.meta.activeSheet, 'plurid-sheet-active');
        }
    }
}

/**
 * Checks if the path contains a <plurid-sheet> element
 *
 * @param {Array} path
 * @return {string}
 */
function checkSheet(path) {
    for (const pathElement of path) {
        if (pathElement.nodeName === 'PLURID-SHEET') {
            return pathElement.id;
        }
    }
}

/**
 * Remove CSS class .plurid-sheet-active.
 *
 * @param {string} sheetId
 */
export function removeActiveSheetShadow(sheetId, activeSheetClass) {
    const sheet = document.getElementById(sheetId);

    if (sheet) {
        sheet.classList.remove(activeSheetClass);
    }
}

/**
 * Add CSS class .plurid-sheet-active.
 *
 * @param {string} sheetId
 */
export function addActiveSheetShadow(sheetId, activeSheetClass) {
    const sheet = document.getElementById(sheetId);

    if (sheet) {
        sheet.classList.add(activeSheetClass);
    }
}
