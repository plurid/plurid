import { contentOptions } from "./options-core.js"


var pluridContainerOptions = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            this.id = "plurid-options";
            this.innerHTML = contentOptions();
        }
    }
});

document.registerElement( "plurid-options", {
    prototype: pluridContainerOptions
});
