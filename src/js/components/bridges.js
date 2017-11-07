// Bridges

var pluridBridges = document.getElementsByTagName('a');

// console.log(pluridBridges[0]);

function pluridifyBridges(bridges) {
    for (i = 0; i < bridges.length; i++) {
        bridges[i].addEventListener('click', function(event) {
            event.preventDefault();

            var newDiv = document.createElement("div")

            newDiv.innerHTML = '<div class="plurid-bridge-container">' +
                                    '<div class="plurid-bridge">' +
                                        '<iframe src="' +
                                            this.href +
                                            '"></iframe>' +
                                    '</div>' +
                                '</div>'

            this.parentElement.parentElement.parentElement.appendChild(newDiv);

            // console.log(this.parentElement.parentElement)
        })

    }
}

pluridifyBridges(pluridBridges);
