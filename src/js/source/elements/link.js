class PluridLink extends HTMLElement {
    constructor() {
        super();

        // this.namedPage = this.getNamedPage(this.page);
        // console.log(this.namedPage);
    }

    get page() {
        return this.getAttribute('page');
    }
    set page(newPage) {
        this.setAttribute('page', newPage);
    }

    getNamedPage(pageName) {
        let pluridPages = document.getElementsByTagName('plurid-page');

        for (let pluridPage of pluridPages) {
            if (pluridPage.name == pageName) {
                return pluridPage;
            }
        }
    }
}

customElements.define('plurid-link', PluridLink);
