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
                    console.log(doc.body);

                    let newBranch = document.createElement("plurid-branch");

                    // newBranch.innerHTML = `
                    //                         <plurid-insertion></plurid-insertion>
                    //                         <plurid-bridge></plurid-bridge>

                    //                         <plurid-scion>
                    //                             <plurid-sheet>
                    //                                 <plurid-content>
                    //                                 ${doc.body.innerText}
                    //                                 </plurid-content>
                    //                             </plurid-sheet>
                    //                         </plurid-scion>
                    //                     `;
                    newBranch.innerHTML = `${doc.body.innerHTML}`;

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
