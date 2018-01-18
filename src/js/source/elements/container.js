import { transform } from "./container-core.js";
import { renderOptions,
         displayOptions,
         contentOptions } from "./options-core.js";



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
            this.id = "plurid-options";
            this.innerHTML = contentOptions();
        }
    }
});

document.registerElement( "plurid-options", {
    prototype: pluridContainerOptions
});
