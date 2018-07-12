import { setLink } from '../elements/sheet-core';


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
        let pluridRoots = document.createElement("plurid-roots");
        container.appendChild(pluridRoots);

        let scripts = document.getElementsByTagName('script');
        body.insertBefore(container, scripts[0]);

        for (let pluridPage of pluridPagesRoots) {
            let pluridRoot = document.createElement("plurid-root");
            let html = pluridPage.innerHTML;
            let pluridSheet = document.createElement('plurid-sheet');
            let pluridContent = document.createElement('plurid-content');
            let pluridShadow = document.createElement('plurid-shadow');

            pluridSheet.appendChild(pluridContent);

            if (pluridPage.visible) {
                pluridSheet.visible = pluridPage.visible;
            }
            pluridContent.innerHTML = html;

            pluridRoot.appendChild(pluridSheet);
            pluridRoot.appendChild(pluridShadow);
            pluridRoots.appendChild(pluridRoot);

            pluridShadow.sheet = pluridSheet.id;
            // console.log('----------');
            let sheetHeight = pluridSheet.offsetHeight;
            // console.log('sheetHeight', sheetHeight);

            // issues with specific shadow height
            // let computedShadowHeight = sheetHeight * 0.3 < 400 ? sheetHeight * 0.3 : 400;
            let computedShadowHeight = 400;
            // console.log('computedShadowHeight', computedShadowHeight);

            pluridShadow.style.height = computedShadowHeight + "px";
            // pluridShadow.style.height = "200px";
            // let shadowHeight = parseInt(pluridShadow.style.height);
            // console.log('shadowHeight', computedShadowHeight);
            let ground = pluridScene.metadata.ground;
            // console.log('ground 1', ground);

            if (sheetHeight > ground) {
                // console.log('sh', sheetHeight - computedShadowHeight);
                pluridScene.metadata.ground = sheetHeight - computedShadowHeight;
                ground = pluridScene.metadata.ground;
            }
            // else {
            //     ground = ground + computedShadowHeight;
            // }

            console.log('ground 2', ground);
            pluridShadow.style.transform = `translateX(0px) translateY(${ground}px) translateZ(0px) rotateX(90deg) rotateY(0deg) rotateZ(0deg) scale(1) skew(-30deg)`;


            let reflectGround = ground - sheetHeight + computedShadowHeight;
            // console.log(reflectGround);
            // -webkit-box-reflect: below 0 linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(30,30,30,0.25) 20%, rgba(60,60,60,0) 40%);
            pluridSheet.style.webkitBoxReflect = `below ${reflectGround}px linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(30,30,30,0.25) 20%, rgba(60,60,60,0) 40%)`;

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
    let transformOrigin = pluridScene.metadata.transformOrigin;

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
    let transformOrigin = pluridScene.metadata.transformOrigin;
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



// function getGroundFloor() {
//     // get the sheet with the lowest translationY
//     // add that sheet's height to the translationY

// }