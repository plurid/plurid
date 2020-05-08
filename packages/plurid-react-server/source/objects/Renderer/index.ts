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
    private htmlLanguage: string;
    private htmlAttributes: string;
    private head: string;
    private defaultStyle: string;
    private styles: string;
    private stripeScript: string;
    private headScripts: string;
    private vendorScriptSource: string;
    private mainScriptSource: string;
    private bodyAttributes: string;
    private root: string;
    private content: string;
    private windowSizerScript: string;
    private reduxState: string;
    private pluridState: string;
    private bodyScripts: string;

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

        this.htmlLanguage = 'en';
        this.htmlAttributes = htmlAttributes || '';
        this.head = head;
        this.defaultStyle = '';
        this.styles = styles;
        this.stripeScript = stripeScript || '';
        this.headScripts = '';
        this.vendorScriptSource = vendorScript || '';
        this.mainScriptSource = script || DEFAULT_RENDERER_SCRIPT;
        this.bodyAttributes = bodyAttributes || '';
        this.root = root || 'root',
        this.content = content;
        this.windowSizerScript = windowSizerScript || DEFAULT_WINDOW_SIZER_SCRIPT;
        this.reduxState = this.safeStore(store) || DEFAULT_RENDERER_STORE;
        this.pluridState = '';
        this.bodyScripts = '';
    }

    public html() {
        return template({
            htmlLanguage: this.htmlLanguage,
            htmlAttributes: this.htmlAttributes,
            head: this.head,
            defaultStyle: this.defaultStyle,
            styles: this.styles,
            stripeScript: this.stripeScript,
            headScripts: this.headScripts,
            vendorScriptSource: this.vendorScriptSource,
            mainScriptSource: this.mainScriptSource,
            bodyAttributes: this.bodyAttributes,
            root: this.root,
            content: this.content,
            windowSizerScript: this.windowSizerScript,
            reduxState: this.reduxState,
            pluridState: this.pluridState,
            bodyScripts: this.bodyScripts,
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
