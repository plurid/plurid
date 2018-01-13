import * as command from "./commands.js";


////////////
// CONTAINER
var pluridContainer = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            command.transform(this);
        }
    }
});

document.registerElement( "plurid-container", {
    prototype: pluridContainer
});


var pluridContainerOptions = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridContainerOptions works");
        }
    }
});

document.registerElement( "plurid-options", {
    prototype: pluridContainerOptions
});

