var pluridRoots = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
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
            this.id=`plurid-root-${rootId}`;
            rootId++;
        }
    }
});

document.registerElement( "plurid-root", {
    prototype: pluridRoot
});
