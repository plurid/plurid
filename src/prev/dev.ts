import { setReflections } from './core/logic/reflections';
import { setShadows } from './core/logic/shadows';
import { setLink } from './elements/sheet/sheet-core';



/**
 * Checks document if it contains the HTML tag <plurid-container>.
 *
 * @return {boolean}
 */
function checkForContainers(): boolean {
    return !!document.getElementsByTagName('plurid-container')[0];
}


/**
 * Checks recursively if the parents of the given pluridElement
 * have the nodeName 'PLURID-PAGE'.
 *
 * @param {object} pluridElement            Given <plurid-page> element.
 * @return {boolean}                        True if pluridElement should be a <plurid-root>.
 */
function checkPluridParent(pluridElement: any): any {
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
 * Given an adequately plurid-formatted HTML document,
 * generates the plurid structure.
 */
function setContainer() {
    if (!checkForContainers()) {
        // console.log(checkForContainers());
        const body = document.body;
        // console.log(body);
        // console.log('-----');
        const pluridPages = document.getElementsByTagName('plurid-page');
        const pluridPagesRoots = [];

        const pluridLinks = document.getElementsByTagName('plurid-link');

        for (const pluridPage of pluridPages) {
            // console.log(pluridPage.name);
            // console.log(pluridPage.visible);
            if (checkPluridParent(pluridPage)) {
                pluridPagesRoots.push(pluridPage);
            }
        }
        // console.log(pluridPagesRoots);

        const container = document.createElement("plurid-container");
        const pluridSpace = document.createElement("plurid-space");
        // const div = document.createElement('div');
        // div.classList.add('testing');
        const pluridRoots = document.createElement("plurid-roots");
        pluridSpace.appendChild(pluridRoots);
        container.appendChild(pluridSpace);
        // div.appendChild(pluridRoots);
        // container.appendChild(div);

        const scripts = document.getElementsByTagName('script');

        // body.insertBefore(container, scripts[0]);
        // cypress error
        body.appendChild(container);

        for (const pluridPage of pluridPagesRoots) {
            const pluridRoot = document.createElement("plurid-root");
            const html = pluridPage.innerHTML;
            const pluridSheet = document.createElement('plurid-sheet');
            const pluridContent = document.createElement('plurid-content');

            pluridSheet.appendChild(pluridContent);

            if ((<any> pluridPage).visible) {
                (<any> pluridSheet).visible = (<any> pluridPage).visible;
            }
            pluridContent.innerHTML = html;

            pluridRoot.appendChild(pluridSheet);
            pluridRoots.appendChild(pluridRoot);

            // console.log('----------');
            const sheetHeight = pluridSheet.offsetHeight;
            let ground = (<any> window).pluridScene.meta.ground;

            if (sheetHeight > ground) {
                (<any> window).pluridScene.meta.ground = sheetHeight;
                ground = (<any> window).pluridScene.meta.ground;
            }

            const shadows = (<any> window).pluridScene.meta.shadows;
            if (shadows === true) {
                setShadows(pluridRoot, pluridSheet, sheetHeight, ground);
            }

            const reflections = (<any> window).pluridScene.meta.reflections;
            if (reflections === true) {
                setReflections(pluridSheet, sheetHeight, ground);
            }
        }

        for (let i = pluridPages.length - 1; i >= 0; i--) {
            // console.log(pluridPages[i]);
            pluridPages[i].parentNode!.removeChild(pluridPages[i]);
        }

        // setLink();
        // console.log(container);
    } else {
        const containers = document.getElementsByTagName('plurid-container');

    }
}
setContainer();




function setTransformOriginCoordinates() {
    const elementPositiveX = 200;
    const elementNegativeX = -210;
    const elementPositiveY = 231;
    const elementNegativeY = -211;
    const elementPositiveZ = 131;
    const elementNegativeZ = -1231;
    const transformOrigin = (<any> window).pluridScene.meta.transformOrigin;

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
    const transformOrigin = (<any> window).pluridScene.meta.transformOrigin;
    const positiveX = transformOrigin.maxPositiveX;
    const negativeX = transformOrigin.maxNegativeX;
    const positiveY = transformOrigin.maxPositiveY;
    const negativeY = transformOrigin.maxNegativeY;
    const positiveZ = transformOrigin.maxPositiveZ;
    const negativeZ = transformOrigin.maxNegativeZ;

    transformOrigin.transformOriginX = (positiveX + negativeX) / 2;
    transformOrigin.transformOriginY = (positiveY + negativeY) / 2;
    transformOrigin.transformOriginZ = (positiveZ + negativeZ) / 2;
}

calculateTransformOriginCenters();
