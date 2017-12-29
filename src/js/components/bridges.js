// Bridges

var pluridBridges = document.getElementsByTagName('a');

// console.log(pluridBridges[0]);
var id = 0

function pluridifyBridges(bridges) {
    for (i = 0; i < bridges.length; i++) {
        bridges[i].addEventListener('click', function(event) {
            event.preventDefault();

            var bridgeId = "plurid-bridge-" + id;
            var newDiv = document.createElement("div")

            newDiv.innerHTML = `<div class="plurid-bridge-container ${bridgeId}">` +
                                    '<div class="plurid-bridge">' +
                                        '<iframe src="' +
                                            this.href +
                                            '"></iframe>' +
                                    '</div>' +
                                '</div>'

            // this.parentElement.parentElement.parentElement.appendChild(newDiv);
            this.parentElement.appendChild(newDiv);

            var pluridBridge = document.getElementsByClassName(bridgeId)[0];

            pluridBridge.style.marginLeft = this.offsetLeft - 570 + "px";
            pluridBridge.style.marginTop = -50 + "px";
            console.log(pluridBridge)
            // console.log(pluridBridge)
            console.log(this.offsetLeft, this.offsetTop)
            // console.log(-this.offsetLeft, -this.offsetTop)
            // console.log(this.getBoundingClientRect().left + window.scrollX, this.getBoundingClientRect().top + window.scrollY)
            // console.log(this.getBoundingClientRect().left, this.getBoundingClientRect().top)
            // console.log(this)


            id += 1;
            // console.log(this.parentElement.parentElement)
        })

    }
}

pluridifyBridges(pluridBridges);
