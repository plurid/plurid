import * as transcore from "./transforms-core.js";


function setLink() {
    let pageBody = document.getElementsByTagName('body');

    let anchorTags = document.getElementsByTagName('a');
    let pluridLinkTags = document.getElementsByTagName('plurid-link');
    // let pluridRoot = document.getElementById('plurid-root-1');

    for (var i = 0; i < anchorTags.length; i++) {
        let anchorTag = anchorTags[i];

        anchorTag.addEventListener('click', event => {
            event.preventDefault();
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(this.responseText, "text/html");
                    // console.log(doc.body);
                    // console.log(pluridRoot);

                    let newBranch = document.createElement("plurid-branch");
                    // newBranch.id="test";

                    newBranch.innerHTML = `
                                            <plurid-insertion></plurid-insertion>
                                            <plurid-bridge></plurid-bridge>

                                            <plurid-scion>
                                                <plurid-sheet>
                                                    <plurid-content>
                                                    ${doc.body.innerHTML}
                                                    </plurid-content>
                                                </plurid-sheet>
                                            </plurid-scion>
                                        `;
                    // newBranch.innerHTML = `${doc.body.innerHTML}`;
                    let right = anchorTag.offsetLeft + anchorTag.offsetWidth;
                    let top = anchorTag.offsetTop;
                    // make the transform based after multiplying with a transform factor?
                    // console.log(anchorTag.getBoundingClientRect().right);
                    // console.log(anchorTag.offsetLeft);
                    // console.log(anchorTag.offsetTop);
                    console.log('anchor right -- X', right);
                    console.log('anchor top ---- Y', top);
                    // console.log('offset parent', anchorTag.offsetParent);

                    let pluridRoot = getPluridRoot(anchorTag);

                    // console.log(transcore.getTransformRotate(pluridRoot).rotateY);
                    // let angleRad = transcore.getTransformRotate(pluridRoot).rotateY;
                    let angleDeg = 90;
                    // Math.floor(Math.random() * 180);
                    newBranch.style.transform = `translateX(${right}px) translateY(${top}px) translateZ(0px) rotateX(0deg) rotateY(${angleDeg}deg) rotateZ(0deg) scale(1)`;


                    let lastChild = pluridRoot.lastChild;
                    // console.log(lastChild);

                    insertAfter(newBranch, lastChild);
                    // renderBranch();
                    setLink();
                    setContainer();
                }
            };

            xhttp.open("GET", anchorTag.href, true);
            xhttp.setRequestHeader("Cache-Control", "no-cache");
            xhttp.setRequestHeader("Pragma", "no-cache");
            xhttp.send();
        });
    }

    for (let pluridLink of pluridLinkTags) {
        pluridLink.addEventListener('click', event => {
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(this.responseText, "text/html");
                    // console.log(doc.body);
                    // console.log(pluridRoot);

                    let newBranch = document.createElement("plurid-branch");
                    // newBranch.id="test";

                    newBranch.innerHTML = `
                                            <plurid-insertion></plurid-insertion>
                                            <plurid-bridge></plurid-bridge>

                                            <plurid-scion>
                                                <plurid-sheet>
                                                    <plurid-content>
                                                    ${doc.body.innerHTML}
                                                    </plurid-content>
                                                </plurid-sheet>
                                            </plurid-scion>
                                        `;

                    let right = pluridLink.offsetLeft + pluridLink.offsetWidth;
                    let top = pluridLink.offsetTop;
                    console.log('pluridLink right -- X', right);
                    console.log('pluridLink top ---- Y', top);
                    // console.log('offset parent', anchorTag.offsetParent);

                    let pluridRoot = getPluridRoot(pluridLink);
                    // console.log(pluridRoot);

                    let angleRad = transcore.getTransformRotate(pluridRoot).rotateY;
                    // console.log(angleRad);
                    let angleDeg = 90;
                    // console.log(angleDeg);
                    newBranch.style.transform = `translateX(${right}px) translateY(${top}px) translateZ(0px) rotateX(0deg) rotateY(${angleDeg}deg) rotateZ(0deg) scale(1)`;



                    let lastChild = pluridRoot.lastChild;

                    insertAfter(newBranch, lastChild);
                    setLink();
                    setContainer();
                }
            };

            xhttp.open("GET", pluridLink.page, true);
            xhttp.setRequestHeader("Cache-Control", "no-cache");
            xhttp.setRequestHeader("Pragma", "no-cache");
            xhttp.send();
        })
    }
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function checkForContainers() {
    return !!document.getElementsByTagName('plurid-container')[0];
}

function setContainer() {
    if (!checkForContainers()) {
        // console.log(checkForContainers());
        const body = document.body;
        // console.log(body);

        // console.log('-----');
        let pluridPages = document.getElementsByTagName('plurid-page');
        let pluridPagesRoots = []

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
            pluridPages[i].parentNode.removeChild(pluridPages[i]);
        }

        let scripts = document.getElementsByTagName('script');
        // console.log(scripts);

        body.insertBefore(container, scripts[0]);

        setLink()
        // console.log(container);
    } else {
        let containers = document.getElementsByTagName('plurid-container');

        // console.log('a', containers);
    }
}


setLink()
setContainer()



function generatePluridStructure(page) {
    // receives a plurid-page
    // generates the content of it
}


/**
 * Checks recursively if the parents of the given pluridElement are <plurid-page>
 *
 * @param {object} pluridElement    Given <plurid-page> element.
 * @return {boolean}                True if pluridElement should be a <plurid-root>.
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


function getPluridRoot(pluridLink) {
    // console.log(pluridLink.parentElement.parentElement.parentElement.parentElement.nodeName);
    if (pluridLink.parentElement.nodeName == 'PLURID-ROOT') {
        // console.log('is NOT a plurid root');
        return pluridLink.parentElement;
    } else {
        return getPluridRoot(pluridLink.parentElement);
    }

}