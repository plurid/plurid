import { transform } from "./container-core.js";
import { initOptions } from "./options.js";
import { initShortcuts } from "../logic/shortcuts.js";
import { renderBranch } from "./branch-core.js";
import { renderOptions,
         displayOptions } from "./options-core.js";



var pluridContainer = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            transform(this);

            initOptions()
            renderOptions(this);
            displayOptions(this);

            initShortcuts(this);

            renderBranch();

        }
    }
});

document.registerElement( "plurid-container", {
    prototype: pluridContainer
});
