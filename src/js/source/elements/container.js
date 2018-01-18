import { transform,
         renderOptions,
         displayOptions,
         contentOptions } from "./commands.js";


////////////
// CONTAINER
var pluridContainer = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            transform(this);
            renderOptions(this);
            displayOptions(this);
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
            this.id = "plurid-options";
            this.innerHTML = contentOptions();
        }
    }
});

document.registerElement( "plurid-options", {
    prototype: pluridContainerOptions
});
