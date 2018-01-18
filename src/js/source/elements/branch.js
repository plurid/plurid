var pluridBranch = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            // console.log("pluridBranch works");
        }
    }
});

document.registerElement( "plurid-branch", {
    prototype: pluridBranch
});



var pluridInsertion = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            // console.log("pluridInsertion works");
        }
    }
});

document.registerElement( "plurid-insertion", {
    prototype: pluridInsertion
});



var pluridBridge = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            // console.log("pluridBridge works");
        }
    }
});

document.registerElement( "plurid-bridge", {
    prototype: pluridBridge
});



var pluridScion = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            // console.log("pluridScion works");
        }
    }
});

document.registerElement( "plurid-scion", {
    prototype: pluridScion
});
