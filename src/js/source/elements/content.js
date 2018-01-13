import * as command from "./commands.js";


var pluridContent = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridContent works");
        }
    }
});

document.registerElement( "plurid-content", {
    prototype: pluridContent
});
