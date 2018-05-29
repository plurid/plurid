function setLink() {
    let pageBody = document.getElementsByTagName('body');

    let anchorTags = document.getElementsByTagName('a');

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

                    let newBranch = document.createElement("plurid-branch");

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

                    insertAfter(newBranch, anchorTag);
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

        console.log('a', containers);
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
