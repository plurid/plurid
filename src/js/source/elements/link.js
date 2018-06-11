var linkId = 1;

class PluridLink extends HTMLElement {
    constructor() {
        super();

        if (this.innerHTML == "") {
            this.innerHTML = '&#9624;'; // 'QUADRANT UPPER LEFT' (U+2598)
            // this.innerHTML = '&#9612;'; // 'LEFT HALF BLOCK' (U+258C)
            // this.innerHTML = '&#9614;'; // 'LEFT ONE QUARTER BLOCK' (U+258E)
        }

        this.addEventListener('click', event => {
            let right = this.offsetLeft + this.offsetWidth;
            let top = this.offsetTop;
            // console.log('link right -- X', right);
            // console.log('link top ---- Y', top);
            // console.log(this.page);
        })

        this.id=`plurid-link-${linkId}`;
        linkId++;
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
