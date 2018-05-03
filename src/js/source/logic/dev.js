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


setLink()

setContainer()


function checkForContainers() {
    return !!document.getElementsByTagName('plurid-container')[0];
}

function setContainer() {
    if (!checkForContainers()) {
        // console.log(checkForContainers());
        let body = document.body;
        let pluridPages = document.getElementsByTagName('plurid-page');
        console.log('-----');
        console.log(pluridPages);

        let container = document.createElement("plurid-container");
        let pluridRoots = document.createElement("plurid-roots");
        let pluridRoot = document.createElement("plurid-root");

        pluridRoots.appendChild(pluridRoot);
        container.appendChild(pluridRoots);

        for (let pluridPage of pluridPages) {
            let html = pluridPage.innerHTML;
            let plurid = document.createElement('plurid-sheet');
            plurid.innerHTML = html;
            pluridRoot.appendChild(plurid);
        }

        body.removeChild(body.children[0]);
        // body.removeChild(body.children[0]);

        let scripts = document.getElementsByTagName('script');
        // console.log(scripts);

        body.insertBefore(container, scripts[0]);

        setLink()
        console.log(container);
    }
}
