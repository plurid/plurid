export function renderBranch() {
    let allAnchorTags = document.getElementsByTagName("a");
    let sameOriginAnchorTags = new Set();
    let pageOrigin = window.location.origin;

    for (let anchorTag of allAnchorTags) {
        if (pageOrigin == anchorTag.origin) {
            sameOriginAnchorTags.add(anchorTag);
            // console.log(anchorTag);
        }
    }

    console.log(sameOriginAnchorTags);

    for (let anchorTag of sameOriginAnchorTags) {
        anchorTag.addEventListener("click", event => {
            event.preventDefault();
            // console.log(anchorTag.href);
            // console.log(anchorTag);

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // console.log(this.responseText);
                    // pluridifyResponse(this.responseText);
                    console.log("a");

                    let newBranch = document.createElement("plurid-branch");

                    let newBranchContent = `
                                            <h1>Works</h1>
                                            <a href="http://localhost:8000/test/examples/insert.html">Text</a>
                                            <p>This is inserted:</p>
                                            ${this.responseText}
                                            `;

                    newBranch.innerHTML = `
                                            <plurid-insertion></plurid-insertion>
                                            <plurid-bridge></plurid-bridge>

                                            <plurid-scion>
                                                <plurid-sheet>
                                                    <plurid-content>
                                                    ${newBranchContent}
                                                    </plurid-content>
                                                </plurid-sheet>
                                            </plurid-scion>
                                        `;

                    insertAfter(newBranch, anchorTag);
                    renderBranch();
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

// function pluridifyResponse(response) {
//     let parser = document.createElement('body');
//     parser.innerHTML = response;

//     let anchorTags = parser.getElementsByTagName("a");

//     console.log(anchorTags);
// }