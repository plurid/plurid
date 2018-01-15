import * as command from "./commands.js";


////////
// ROOTS
var pluridRoots = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridRoots works");
            this.id=`plurid-roots`;
        }
    }
});

document.registerElement( "plurid-roots", {
    prototype: pluridRoots
});



var rootId = 1;

var pluridRoot = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridRoot works");
            this.id=`plurid-root-${rootId}`;
            // console.log(this.id);
            rootId++;
        }
    }
});

document.registerElement( "plurid-root", {
    prototype: pluridRoot
});