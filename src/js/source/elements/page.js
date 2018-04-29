import { getPluridPage } from "./page-core.js";

// var pluridPage = Object.create(HTMLElement.prototype, {
//     createdCallback: {
//         value: function() {
//             pluridScene.content.plurid = this;
//             getPluridPage();
//             // initialize pluridScene object

//             // initialize containers, options, sheets, controls

//         }
//     }
// });


// document.registerElement( "plurid-page", {
//     prototype: pluridPage
// });


class PluridPage extends HTMLElement {
    constructor() {
        super()

        console.log('a plurid page');
    }
}

customElements.define('plurid-page', PluridPage);