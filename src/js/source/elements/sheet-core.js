import * as transcore from "../logic/transforms-core";


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



var branchId = 1;

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
            newBranch.id = `plurid-branch-${branchId}`;
            branchId++;

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
            if (pluridBranch) {
                angleBranch = transcore.getTransformRotate(pluridBranch).rotateY;
                angleBranch = angleBranch * 180 / Math.PI;
            }
            // console.log(angleBranch);

            let linkParentId = pluridBranch ? pluridBranch.id : pluridSheet.id;
            console.log(linkParentId, 'is the parent of', newBranch.id);
            let parentBranch = pluridScene.getBranchById(linkParentId);
            console.log('the parentBranch is ', parentBranch);

            let bridgeLength = 100;

            let parentAngleY = parentBranch ? parentBranch.coordinates.angleY : 0;
            // console.log('parentAngleY % 360', parentAngleY % 360)
            parentAngleY = parentAngleY % 360;
            console.log('parentAngleY', parentAngleY)

            let quadrant = getQuadrant(parentAngleY);
            let quadrantCoefficients = getQuadrantCoefficients(quadrant);
            let quadrantCoefX = quadrantCoefficients.X;
            let quadrantCoefZ = quadrantCoefficients.Z;

            console.log('parent quadrant', quadrant);
            console.log('quadrantCoefX', quadrantCoefX);
            console.log('quadrantCoefZ', quadrantCoefZ);

            let rotXbranch = angleDeg;

            let prevTransX;
            let prevTransY;
            if (parentBranch) {
                prevTransX = parentBranch.coordinates.linkX;
                prevTransY = parentBranch.coordinates.transY ? parentBranch.coordinates.transY : parentBranch.coordinates.linkY;
            }

            let clickTransX = right;
            let clickTransY = top;

            console.log('prevTransX', prevTransX);
            console.log('prevTransY', prevTransY);
            console.log('clickTransX', clickTransX);
            console.log('clickTransY', clickTransY);

            let translationData = {
                prevTransX: prevTransX,
                prevTransY: prevTransY,
                clickTransX: clickTransX,
                clickTransY: clickTransY,
                bridgeLength: bridgeLength,
                quadrant: quadrant,
                quadrantCoefX: quadrantCoefX,
                quadrantCoefZ: quadrantCoefZ,
                rotXbranch: rotXbranch
            }

            let translations = getTranslations(translationData);
            let transX = translations.X;
            let transY = translations.Y;
            let transZ = translations.Z;
            // console.log('transX', transX);
            // console.log('transY', transY);
            // console.log('transZ', transZ);
            console.log('-----');

            if (angleBranch) {
                angleBranch = angleBranch + 90;
                newBranch.style.transform = `translateX(${transX}px) translateY(${transY}px) translateZ(${transZ}px) rotateX(0deg) rotateY(${angleBranch}deg) rotateZ(0deg) scale(1)`;
            } else {
                newBranch.style.transform = `translateX(${right}px) translateY(${top}px) translateZ(0px) rotateX(0deg) rotateY(${angleDeg}deg) rotateZ(0deg) scale(1)`;
            }

            let lastChild = pluridRoot.lastChild;

            insertAfter(newBranch, lastChild);

            let angleRotY = angleBranch ? angleBranch : angleDeg;

            let sceneObject = {
                linkParentId: linkParentId,
                link: newBranch.link,
                branchId: newBranch.id,
                coordinates: {
                    linkX: right,
                    linkY: top,
                    transX: transX,
                    transY: transY,
                    transZ: transZ,
                    angleY: angleRotY
                },
                children: []
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



var anchorTagId = 1

/**
 * Sets the id on all the <a> anchor tags within a certain <plurid-sheet>
 *
 * @param {string} sheetId          Id of a <plurid-sheet>
 */
export function setAnchorTagsId(sheetId) {
    let pageAnchorTags = document.querySelectorAll(`#${sheetId} a`);

    for (let anchorTag of pageAnchorTags) {
        anchorTag.id = `plurid-anchor-${anchorTagId}`;
        anchorTagId++;
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
            metadata: [],
            children: []
        };

        pluridScene.metadata.rootSheets.push(pluridSheet.id);
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
            quadrantCoefficientX = -1;
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


function getTranslations(translationData) {
    let prevTransX = translationData.prevTransX;
    let prevTransY = translationData.prevTransY;
    let clickTransX = translationData.clickTransX;
    let clickTransY = translationData.clickTransY;
    let bridgeLength = translationData.bridgeLength;
    let quadrant = translationData.quadrant;
    let quadrantCoefX = translationData.quadrantCoefX;
    let quadrantCoefZ = translationData.quadrantCoefZ;
    let rotXbranch = translationData.rotXbranch;
    let transX;
    let transY;
    let transZ;

    if (quadrant == 'quadrantB') {
        console.log('AAA > quadrantB');
        // transX = quadrantCoefX * ((prevTransX - (clickTransX + bridgeLength)) * Math.cos(rotXbranch * Math.PI / 180));
        transX = quadrantCoefX * (261 - (clickTransX + bridgeLength));
        // transZ = quadrantCoefZ * ((prevTransX + bridgeLength) * Math.sin(rotXbranch * Math.PI / 180));
        transZ = quadrantCoefZ * (prevTransX + bridgeLength);
    } else {
        transX = quadrantCoefX * (prevTransX + (clickTransX + bridgeLength) * Math.cos(rotXbranch * Math.PI / 180))
        transZ = quadrantCoefZ * (clickTransX + bridgeLength) * Math.sin(rotXbranch * Math.PI / 180);
    }

    transY = prevTransY + clickTransY;

    return {
        X: transX,
        Y: transY,
        Z: transZ,
    }
}
