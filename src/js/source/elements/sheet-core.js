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
            // console.log(doc.body);
            // console.log(pluridRoot);

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
            // console.log('offset parent', anchorTag.offsetParent);

            let pluridRoot = getSpecifiedParent(pluridLink, 'PLURID-ROOT');
            let pluridSheet = getSpecifiedParent(pluridLink, 'PLURID-SHEET');
            let pluridBranch = getSpecifiedParent(pluridLink, 'PLURID-BRANCH');
            // console.log('link', pluridLink);
            // console.log('root', pluridRoot);
            // console.log('sheet', pluridSheet);
            // console.log('branch', pluridBranch);
            let angleBranch;
            // let angleRad = transcore.getTransformRotate(pluridRoot).rotateY;
            // console.log(angleRad);
            if (pluridBranch) {
                angleBranch = transcore.getTransformRotate(pluridBranch).rotateY;
                angleBranch = angleBranch * 180 / Math.PI;
            }
            // console.log(angleBranch);

            let angleDeg = 90;
            // console.log(angleDeg);


            // calculate transX, transY, transZ based on:
            // plurid-link's position within the plurid-sheet
            // plurid-sheet's plurid-branch rotateY
            //
            let bridgeLength = 100;

            let quadrantCoefX;
            let quadrantCoefZ;
            let quadrant;

            if (angleDeg > 0 && angleDeg <= 90) {
                quadrant = 'quadrantA';
            }
            if (angleDeg > 90 && angleDeg <= 180) {
                quadrant = 'quadrantB';
            }
            if (angleDeg > 180 && angleDeg <= 270) {
                quadrant = 'quadrantC';
            }
            if (angleDeg > 270 && angleDeg <= 360) {
                quadrant = 'quadrantD';
            }


            switch (quadrant) {
                case 'quadrantA':
                    quadrantCoefX = 1
                    quadrantCoefZ = -1
                    break;
                case 'quadrantB':
                    quadrantCoefX = 1
                    quadrantCoefZ = -1
                    break;
                case 'quadrantC':
                    quadrantCoefX = 1
                    quadrantCoefZ = -1
                    break;
                case 'quadrantD':
                    quadrantCoefX = 1
                    quadrantCoefZ = -1
                    break;
                // default:
                //     quadrantCoefX = 1
                //     quadrantCoefZ = -1
                //     break;
            }

            // console.log(quadrant);
            // console.log('quadrantCoefX', quadrantCoefX);
            // console.log('quadrantCoefZ', quadrantCoefZ);

            let rotXbranch = angleDeg;
            // let prevTransX = 261;
            // let prevTransY = 257;
            // let clickTransX = 1067;
            // let clickTransY = 200;


            let linkParentId = pluridBranch ? pluridBranch.id : pluridSheet.id;
            // console.log(linkParentId, 'is the parent of', newBranch.id);

            function getBranchById(linkParentId) {
                for (let rootElement of pluridScene.content) {
                    for (let child of rootElement.children) {
                        if (child.branchId == linkParentId) {
                            // console.log(child);
                            return child;
                        } else if (child.children != []) {
                            return getChild(linkParentId, child.children);
                        }
                    }
                }
            }

            function getChild(linkParentId, children) {
                for (let child of children) {
                    if (child.branchId == linkParentId) {
                        // console.log(child);
                        return child;
                    } else if (child.children != []) {
                        return getChild(linkParentId, child.children);
                    }
                }
            }

            let parentBranch = getBranchById(linkParentId);
            // let parentBranch = pluridScene.getBranchById(linkParentId);

            let prevTransX;
            let prevTransY;
            if (parentBranch) {
                prevTransX = parentBranch.coordinates.linkX;
                prevTransY = parentBranch.coordinates.linkY;
            }

            let clickTransX = right;
            let clickTransY = top;

            // console.log(prevTransX);
            // console.log(prevTransY);

            // console.log(Math.cos(rotXbranch * Math.PI / 180));

            let transX = quadrantCoefX * (prevTransX + (clickTransX + bridgeLength) * Math.cos(rotXbranch * Math.PI / 180))
            let transY = prevTransY + clickTransY;
            let transZ = quadrantCoefZ * (clickTransX + bridgeLength) * Math.sin(rotXbranch * Math.PI / 180);
            // let transX = 1086.19;
            // let transY = 457;
            // let transZ = quadrantCoefZ * 825.19;
            // console.log('transX', transX);
            // console.log('transY', transY);
            // console.log('transZ', transZ);

            if (angleBranch) {
                angleBranch = angleBranch + 90;
                newBranch.style.transform = `translateX(${transX}px) translateY(${transY}px) translateZ(${transZ}px) rotateX(0deg) rotateY(${angleBranch}deg) rotateZ(0deg) scale(1)`;
            } else {
                newBranch.style.transform = `translateX(${right}px) translateY(${top}px) translateZ(0px) rotateX(0deg) rotateY(${angleDeg}deg) rotateZ(0deg) scale(1)`;
            }

            let lastChild = pluridRoot.lastChild;

            insertAfter(newBranch, lastChild);



            let sceneObject = {
                linkParentId: linkParentId,
                link: newBranch.link,
                branchId: newBranch.id,
                coordinates: {
                    linkX: right,
                    linkY: top
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
