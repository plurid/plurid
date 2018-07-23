import * as transcore from "../logic/transforms-core";
import { setId } from "./element-utils/utils";
import { setShadows } from '../logic/shadows';
import { setReflections } from '../logic/reflections';


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
    if (pluridElement.nodeName != 'HTML') {
        if (pluridElement.parentElement.nodeName == 'PLURID-PAGE') {
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
    if (pluridElement.nodeName != 'HTML') {
        if (pluridElement.parentElement.nodeName == specifiedParent) {
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
    for (let child of childrenArray) {
        if (child.branchId == sceneObject.linkParentId) {
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
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(this.responseText, "text/html");

            let newBranch = document.createElement("plurid-branch");
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
            newBranch.link = pluridLink.id;
            setId(newBranch, 'branch');


            let right = pluridLink.offsetLeft + pluridLink.offsetWidth;
            let top = pluridLink.offsetTop;
            // console.log('pluridLink right -- X', right);
            // console.log('pluridLink top ---- Y', top);

            let pluridRoot = getSpecifiedParent(pluridLink, 'PLURID-ROOT');
            let pluridSheet = getSpecifiedParent(pluridLink, 'PLURID-SHEET');
            let pluridBranch = getSpecifiedParent(pluridLink, 'PLURID-BRANCH');
            // console.log('link', pluridLink);
            // console.log('root', pluridRoot);
            // console.log('sheet', pluridSheet);
            // console.log('branch', pluridBranch);

            let angleDeg = 90;
            let angleBranch;
            let branchBridge;
            let bridgeWidth;
            if (pluridBranch) {
                angleBranch = transcore.getTransformRotate(pluridBranch).rotateY;
                angleBranch = angleBranch * 180 / Math.PI;
                branchBridge = pluridBranch.children[0];
                bridgeWidth = parseInt(branchBridge.style.width) || 100;
            }
            // console.log(angleBranch);

            let linkParentId = pluridBranch ? pluridBranch.id : pluridSheet.id;
            // console.log(linkParentId, 'is the parent of', newBranch.id);
            let parentBranch = pluridScene.getBranchById(linkParentId);
            // console.log('the parentBranch is ', parentBranch);

            // console.log(bridgeWidth);
            let bridgeLength = bridgeWidth || 100;

            let parentAngleY = parentBranch ? parentBranch.coordinates.angleY : 0;
            // console.log('parentAngleY % 360', parentAngleY % 360)
            parentAngleY = parentAngleY % 360;
            // console.log('parentAngleY', parentAngleY)

            let quadrant = getQuadrant(parentAngleY);
            let quadrantCoefficients = getQuadrantCoefficients(quadrant);
            let quadrantCoefX = quadrantCoefficients.X;
            let quadrantCoefZ = quadrantCoefficients.Z;

            // console.log('parent quadrant', quadrant);
            // console.log('quadrantCoefX', quadrantCoefX);
            // console.log('quadrantCoefZ', quadrantCoefZ);

            let rotXbranch = angleDeg;

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


            let clickTransX = right;
            let clickTransY = top;

            // console.log('prevTransX', prevTransX);
            // console.log('prevTransY', prevTransY);
            // console.log('prevTransZ', prevTransZ);
            // console.log('clickTransX', clickTransX);
            // console.log('clickTransY', clickTransY);


            let path = generatePath(newBranch.id, linkParentId);
            // console.log('path', path);

            let translationData = {
                prevLinkX: prevLinkX,
                prevLinkY: prevLinkY,
                prevTransX: prevTransX,
                prevTransY: prevTransY,
                prevTransZ: prevTransZ,
                clickTransX: clickTransX,
                clickTransY: clickTransY,
                bridgeLength: bridgeLength,
                quadrant: quadrant,
                quadrantCoefX: quadrantCoefX,
                quadrantCoefZ: quadrantCoefZ,
                rotXbranch: rotXbranch,
                path: path
            }

            let translations = getTranslations(translationData);
            let transX = translations.X;
            let transY = translations.Y;
            let transZ = translations.Z;
            // console.log('transX', transX);
            // console.log('transY', transY);
            // console.log('transZ', transZ);
            // console.log('-----');

            if (angleBranch != undefined) {
                angleBranch = angleBranch + 90;
                newBranch.style.transform = `translateX(${transX}px) translateY(${transY}px) translateZ(${transZ}px) rotateX(0deg) rotateY(${angleBranch}deg) rotateZ(0deg) scale(1)`;
            } else {
                newBranch.style.transform = `translateX(${right}px) translateY(${top}px) translateZ(0px) rotateX(0deg) rotateY(${angleDeg}deg) rotateZ(0deg) scale(1)`;
            }

            let lastChild = pluridRoot.lastChild;

            insertAfter(newBranch, lastChild);

            let angleRotY = angleBranch ? angleBranch : angleDeg;
            let branchSheet = newBranch.getElementsByTagName('plurid-sheet')[0];


            // let pluridShadow = document.createElement('plurid-shadow');

            // lastChild = pluridRoot.lastChild;
            // insertAfter(pluridShadow, lastChild);

            // pluridShadow.sheet = branchSheet.id;
            // // console.log('--------');
            // // console.log(branchSheet.offsetHeight);

            let computedShadowHeight = 500;
            // pluridShadow.style.height = computedShadowHeight + "px";

            let branchSheetHeight = branchSheet.offsetHeight;
            let branchSheetWidth = branchSheet.offsetWidth;
            // // console.log('branchSheetWidth', branchSheetWidth);
            // pluridShadow.style.width = branchSheetWidth + "px";

            let ground = pluridScene.meta.ground;
            // console.log(ground);

            // if (branchSheetHeight > ground) {
            //     pluridScene.meta.ground = branchSheetHeight - computedShadowHeight;
            //     ground = pluridScene.meta.ground;
            // }
            // pluridShadow.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(90deg) rotateY(0deg) rotateZ(90deg) scale(1) skew(0deg)`;

            let reflectionY = transY ? transY : top;

            let reflections = pluridScene.meta.reflections;
            if (reflections === true) {
                setReflections(branchSheet, branchSheetHeight, ground, reflectionY);
            }


            let sceneObject = {
                linkParentId: linkParentId,
                link: newBranch.link,
                branchId: newBranch.id,
                sheetId: branchSheet.id,
                coordinates: {
                    prevLinkX: prevLinkX,
                    prevLinkY: prevLinkY,
                    linkX: right,
                    linkY: top,
                    prevTransX: prevTransX,
                    prevTransY: prevTransY,
                    prevTransZ: prevTransZ,
                    transX: transX,
                    transY: transY,
                    transZ: transZ,
                    angleY: angleRotY
                },
                children: [],
                path: path
            }

            for (let rootScene of pluridScene.content) {
                if (rootScene.id == pluridRoot.id) {
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
    let pluridPageId = pluridPage.id;
    let pageAnchorTags = document.querySelectorAll(`#${pluridPageId} a`);
    let pagePluridLinks = document.querySelectorAll(`#${pluridPageId} plurid-link`);

    for (let anchorTag of pageAnchorTags) {
        anchorTag.addEventListener('click', event => {
            event.preventDefault();

            if (!checkBranchExistence(anchorTag.id)) {
                setPluridLinks(anchorTag);
            } else {
                // TODO
                // translate into view of the new plurid-branch
                // console.log('anchorTag already set');
            };
        });
    }

    for (let pluridLink of pagePluridLinks) {
        pluridLink.addEventListener('click', () => {
            if (!checkBranchExistence(pluridLink.id)) {
                setPluridLinks(pluridLink);
            } else {
                // TODO
                // translate into view of the new plurid-branch
                // console.log('pluridLink already set');
            };
        })
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
    let branches = document.getElementsByTagName('plurid-branch');
    let count = 0;

    for (let branch of branches) {
        if (branch.link == linkId) {
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
    let pageAnchorTags = document.querySelectorAll(`#${sheetId} a`);

    for (let anchorTag of pageAnchorTags) {
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
    if (pluridSheet.parentElement.nodeName == 'PLURID-ROOT') {
        let sheet = {
            id: pluridSheet.parentElement.id,
            sheetId: pluridSheet.id,
            meta: [],
            children: []
        };

        pluridScene.meta.rootSheets.push(pluridSheet.id);
        pluridScene.content.push(sheet);
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
        Z: quadrantCoefficientZ
    }
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
    let parent = pluridScene.getBranchById(linkParentId);
    if (parent) {
        let path = [];

        let parentPath = parent.path;
        for (let pathElement of parentPath) {
            let pluridElement = pluridScene.getBranchById(pathElement);
            if (pluridElement.linkParentId != linkParentId) {
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
    let prevLinkX = translationData.prevLinkX;
    let prevLinkY = translationData.prevLinkY;
    let prevTransX = translationData.prevTransX;
    let prevTransY = translationData.prevTransY;
    let prevTransZ = translationData.prevTransZ;
    let clickTransX = translationData.clickTransX;
    let clickTransY = translationData.clickTransY;
    let bridgeLength = translationData.bridgeLength;
    let quadrant = translationData.quadrant;
    let quadrantCoefX = translationData.quadrantCoefX;
    let quadrantCoefZ = translationData.quadrantCoefZ;
    let rotXbranch = translationData.rotXbranch;
    let path = translationData.path;

    let penultimateRoot;
    let penultimateRootTransX;
    let penultimateRootTransZ;
    let penultimateRootAngleY;
    let penultimateRootAngleYRad;
    let penultimate = path.length - 2;

    let transX;
    let transY;
    let transZ;

    if (penultimate > 0) {
        penultimateRoot = pluridScene.getBranchById(path[penultimate]);
        penultimateRootAngleY = penultimateRoot.coordinates.angleY;
        // console.log(penultimateRootAngleY);
        penultimateRootAngleYRad = penultimateRootAngleY * Math.PI / 180;
        penultimateRootTransX = penultimateRoot.coordinates.transX;
        penultimateRootTransZ = penultimateRoot.coordinates.transZ;
    }


    if (path.length == 2) {
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
    }
}


/**
 * Sets eventListener on window to detect active sheet.
 */
function setActiveSheetListener() {
    window.addEventListener('click', event => {
        // cross-browsers eventPath
        let eventPath = event.path || (event.composedPath && event.composedPath());

        setActiveSheet(eventPath);
    })
}
setActiveSheetListener();

/**
 * Set active sheet logic
 */
function setActiveSheet(eventPath) {
    let activeSheet = pluridScene.meta.activeSheet;
    let currentSheet = checkSheet(eventPath);
    if (currentSheet) {
        if (currentSheet != activeSheet) {
            pluridScene.meta.previousActiveSheet = pluridScene.meta.activeSheet;
            pluridScene.meta.activeSheet = currentSheet;

            removeActiveSheetShadow(pluridScene.meta.previousActiveSheet, 'plurid-sheet-active-transform');
            removeActiveSheetShadow(pluridScene.meta.previousActiveSheet, 'plurid-sheet-active');
            addActiveSheetShadow(pluridScene.meta.activeSheet, 'plurid-sheet-active');
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
    for (let pathElement of path) {
        if (pathElement.nodeName == 'PLURID-SHEET') {
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
    let sheet = document.getElementById(sheetId);

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
    let sheet = document.getElementById(sheetId);

    if (sheet) {
        sheet.classList.add(activeSheetClass);
    }
}
