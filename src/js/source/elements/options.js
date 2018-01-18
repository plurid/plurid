import { contentOptions } from "./options-core.js";



export function initOptions() {
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
}
