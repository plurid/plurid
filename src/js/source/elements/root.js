import * as command from "./commands.js";


////////
// ROOTS
var pluridRoots = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridRoots works");
        }
    }
});

document.registerElement( "plurid-roots", {
    prototype: pluridRoots
});



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