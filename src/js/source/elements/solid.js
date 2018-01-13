// PLURID SOLID
var pluridSolid = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridSolid works");
        }
    }
});

document.registerElement( "plurid-solid", {
    prototype: pluridSolid
});



var pluridSolidFront = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridSolidFront works");
        }
    }
});

document.registerElement( "plurid-solid-front", {
    prototype: pluridSolidFront
});



var pluridSolidBack = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridSolidBack works");
        }
    }
});

document.registerElement( "plurid-solid-back", {
    prototype: pluridSolidBack
});



var pluridSolidTop = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridSolidTop works");
        }
    }
});

document.registerElement( "plurid-solid-top", {
    prototype: pluridSolidTop
});



var pluridSolidBottom = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridSolidBottom works");
        }
    }
});

document.registerElement( "plurid-solid-bottom", {
    prototype: pluridSolidBottom
});



var pluridSolidRight = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridSolidRight works");
        }
    }
});

document.registerElement( "plurid-solid-right", {
    prototype: pluridSolidRight
});



var pluridSolidLeft = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            console.log("pluridSolidLeft works");
        }
    }
});

document.registerElement( "plurid-solid-left", {
    prototype: pluridSolidLeft
});
