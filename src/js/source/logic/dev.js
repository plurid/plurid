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

        for (let pluridPage of pluridPagesRoots) {
            let pluridRoot = document.createElement("plurid-root");
            let html = pluridPage.innerHTML;
            let plurid = document.createElement('plurid-sheet');

            if (pluridPage.visible) {
                plurid.visible = pluridPage.visible;
            }
            plurid.innerHTML = html;
            pluridRoot.appendChild(plurid);
            pluridRoots.appendChild(pluridRoot);
        }

        for (let i = pluridPages.length - 1; i >= 0; i--) {
            // console.log(pluridPages[i]);
            pluridPages[i].parentNode.removeChild(pluridPages[i]);
        }

        let scripts = document.getElementsByTagName('script');
        body.insertBefore(container, scripts[0]);

        // setLink();
        // console.log(container);
    } else {
        let containers = document.getElementsByTagName('plurid-container');

    }
}
setContainer()
