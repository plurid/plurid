class PluridSpace extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // let sheetIdNumber = setId(this, 'sheet');
    }
}

customElements.define('plurid-space', PluridSpace);
