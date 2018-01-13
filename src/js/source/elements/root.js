import * as command from "./commands.js";


///////
// ROOT
var pluridRoot = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridRoot works");
        }
    }
});

document.registerElement( "plurid-root", {
    prototype: pluridRoot
});
