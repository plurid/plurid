import { setLink } from './elements/sheet/sheet-core';
import { setShadows } from './core/logic/shadows';
import { setReflections } from './core/logic/reflections';



/**
 * Checks document if it contains the HTML tag <plurid-container>.
 *
 * @return {boolean}
 * */
function checkForContainers() {
    return !!document.getElementsByTagName('plurid-container')[0];
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
 * Given an adequately plurid-formatted HTML document,
 * generates the plurid structure.
 */
function setContainer() {
    if (!checkForContainers()) {
        // console.log(checkForContainers());
        const body = document.body;
        // console.log(body);
        // console.log('-----');
        let pluridPages = document.getElementsByTagName('plurid-page');
        let pluridPagesRoots = [];

        let pluridLinks = document.getElementsByTagName('plurid-link');

        for (let pluridPage of pluridPages) {
            // console.log(pluridPage.name);
            // console.log(pluridPage.visible);
            if (checkPluridParent(pluridPage)) {
                pluridPagesRoots.push(pluridPage);
            }
        }
        // console.log(pluridPagesRoots);

        let container = document.createElement("plurid-container");
        let pluridSpace = document.createElement("plurid-space");
        // let div = document.createElement('div');
        // div.classList.add('testing');
        let pluridRoots = document.createElement("plurid-roots");
        pluridSpace.appendChild(pluridRoots);
        container.appendChild(pluridSpace);
        // div.appendChild(pluridRoots);
        // container.appendChild(div);

        let scripts = document.getElementsByTagName('script');

        // body.insertBefore(container, scripts[0]);
        // cypress error
        body.appendChild(container);

        for (let pluridPage of pluridPagesRoots) {
            let pluridRoot = document.createElement("plurid-root");
            let html = pluridPage.innerHTML;
            let pluridSheet = document.createElement('plurid-sheet');
            let pluridContent = document.createElement('plurid-content');

            pluridSheet.appendChild(pluridContent);

            if (pluridPage.visible) {
                pluridSheet.visible = pluridPage.visible;
            }
            pluridContent.innerHTML = html;

            pluridRoot.appendChild(pluridSheet);
            pluridRoots.appendChild(pluridRoot);

            // console.log('----------');
            let sheetHeight = pluridSheet.offsetHeight;
            let ground = pluridScene.meta.ground;

            if (sheetHeight > ground) {
                pluridScene.meta.ground = sheetHeight;
                ground = pluridScene.meta.ground;
            }

            let shadows = pluridScene.meta.shadows;
            if (shadows === true) {
                setShadows(pluridRoot, pluridSheet, sheetHeight, ground);
            }

            let reflections = pluridScene.meta.reflections;
            if (reflections === true) {
                setReflections(pluridSheet, sheetHeight, ground);
            }
        }

        for (let i = pluridPages.length - 1; i >= 0; i--) {
            // console.log(pluridPages[i]);
            pluridPages[i].parentNode.removeChild(pluridPages[i]);
        }

        // setLink();
        // console.log(container);
    } else {
        let containers = document.getElementsByTagName('plurid-container');

    }
}
setContainer()




function setTransformOriginCoordinates() {
    let elementPositiveX = 200;
    let elementNegativeX = -210;
    let elementPositiveY = 231;
    let elementNegativeY = -211;
    let elementPositiveZ = 131;
    let elementNegativeZ = -1231;
    let transformOrigin = pluridScene.meta.transformOrigin;

    if (elementPositiveX > transformOrigin.maxPositiveX) {
        transformOrigin.maxPositiveX = elementPositiveX;
    }

    if (elementNegativeX < transformOrigin.maxNegativeX) {
        transformOrigin.maxNegativeX = elementNegativeX;
    }

    if (elementPositiveY > transformOrigin.maxPositiveY) {
        transformOrigin.maxPositiveY = elementPositiveY;
    }

    if (elementNegativeY < transformOrigin.maxNegativeY) {
        transformOrigin.maxNegativeY = elementNegativeY;
    }

    if (elementPositiveZ > transformOrigin.maxPositiveZ) {
        transformOrigin.maxPositiveZ = elementPositiveZ;
    }

    if (elementNegativeZ < transformOrigin.maxNegativeZ) {
        transformOrigin.maxNegativeZ = elementNegativeZ;
    }
}

setTransformOriginCoordinates();


function calculateTransformOriginCenters() {
    let transformOrigin = pluridScene.meta.transformOrigin;
    let positiveX = transformOrigin.maxPositiveX;
    let negativeX = transformOrigin.maxNegativeX;
    let positiveY = transformOrigin.maxPositiveY;
    let negativeY = transformOrigin.maxNegativeY;
    let positiveZ = transformOrigin.maxPositiveZ;
    let negativeZ = transformOrigin.maxNegativeZ;

    transformOrigin.transformOriginX = (positiveX + negativeX)/2;
    transformOrigin.transformOriginY = (positiveY + negativeY)/2;
    transformOrigin.transformOriginZ = (positiveZ + negativeZ)/2;
}

calculateTransformOriginCenters();
