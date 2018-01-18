import { transform } from "./container-core.js";
import { initOptions } from "./options.js";
import { renderOptions,
         displayOptions } from "./options-core.js";



var pluridContainer = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            transform(this);

            initOptions()
            renderOptions(this);
            displayOptions(this);
        }
    }
});

document.registerElement( "plurid-container", {
    prototype: pluridContainer
});
