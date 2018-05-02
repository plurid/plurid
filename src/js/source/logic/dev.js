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




function checkForContainers() {
    return !!document.getElementsByTagName('plurid-container')[0];
}


if (!checkForContainers()) {
    // console.log(checkForContainers());
    let body = document.body;
    let pluridPages = document.getElementsByTagName('plurid-page');
    // console.log(pluridPages);

    let container = document.createElement("plurid-container");

    for (let pluridPage of pluridPages) {
        let html = pluridPage.innerHTML;
        let plurid = document.createElement('plurid-sheet');
        plurid.innerHTML = html;
        container.appendChild(plurid);
    }

    console.log(container);

    // for (let i = 0; i < scripts.length; i++) {
    //     body.removeChild(scripts[i]);
    // }

    // for (let script in scripts) {
    //     body.removeChild(script);
    // }

    // let children = body.children;
    // let container = document.createElement("plurid-container");

    // console.log(children);
    // console.log('aa', container);

    // for (let child of children) {
    //     // console.log(child);
    //     // container.appendChild(child);
    // }

    // console.log('bb', container);


    // console.log(container);
    // console.log(body.children);
    // console.log(children);
}