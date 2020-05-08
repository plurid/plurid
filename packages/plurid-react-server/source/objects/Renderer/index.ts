import {
    DEFAULT_RENDERER_STORE,
    DEFAULT_RENDERER_SCRIPT,
    DEFAULT_WINDOW_SIZER_SCRIPT,
} from '../../data/constants';

import {
    PluridRendererConfiguration,
} from '../../data/interfaces';

import template from './template';



export default class PluridRenderer {
    private head: string;
    private styles: string;
    private content: string;
    private store: string;
    private root: string;
    private script: string;
    private windowSizerScript: string;
    private vendorScript: string;
    private stripeScript: string;
    private htmlAttributes: string;
    private bodyAttributes: string;

    constructor(
        configuration: PluridRendererConfiguration,
    ) {
        const {
            head,
            styles,
            content,
            store,
            root,
            script,
            windowSizerScript,
            vendorScript,
            stripeScript,
            htmlAttributes,
            bodyAttributes,
        } = configuration;

        this.head = head;
        this.styles = styles;
        this.content = content;
        this.store = this.safeStore(store) || DEFAULT_RENDERER_STORE;
        this.root = root || 'root',
        this.script = script || DEFAULT_RENDERER_SCRIPT;
        this.windowSizerScript = windowSizerScript || DEFAULT_WINDOW_SIZER_SCRIPT;
        this.vendorScript = vendorScript || '';
        this.stripeScript = stripeScript || '';
        this.htmlAttributes = htmlAttributes || '';
        this.bodyAttributes = bodyAttributes || '';
    }

    public html() {
        return template({
            head: this.head,
            styles: this.styles,
            content: this.content,
            reduxState: this.store,
            pluridState: '',
            root: this.root,
            script: this.script,
            windowSizerScript: this.windowSizerScript,
            vendorScript: this.vendorScript,
            stripeScript: this.stripeScript,
            headScripts: '',
            bodyScripts: '',
            htmlAttributes: this.htmlAttributes,
            htmlLanguage: 'en',
            bodyAttributes: this.bodyAttributes,
        });
    }

    private safeStore(
        store: string,
    ): string {
        return store.replace(
            /</g,
            '\\u003c'
        );
    }
}
