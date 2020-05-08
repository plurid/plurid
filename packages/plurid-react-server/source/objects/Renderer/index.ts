import {
    DEFAULT_RENDERER_REDUX_STATE,
    DEFAULT_RENDERER_PLURID_STATE,
    DEFAULT_RENDERER_SCRIPT,
    DEFAULT_WINDOW_SIZER_SCRIPT,
    DEFAULT__PRELOADED_REDUX_STATE__,
    DEFAULT__PRELOADED_PLURID_STATE__,
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
    private headScripts: string;
    private vendorScriptSource: string;
    private mainScriptSource: string;
    private bodyAttributes: string;
    private root: string;
    private content: string;
    private windowSizerScript: string;
    private defaultPreloadedReduxState: string;
    private reduxState: string;
    private defaultPreloadedPluridState: string;
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
            htmlAttributes,
            bodyAttributes,
        } = configuration;

        this.htmlLanguage = 'en';
        this.htmlAttributes = htmlAttributes || '';
        this.head = head;
        this.defaultStyle = '';
        this.styles = styles;
        this.headScripts = '';
        this.vendorScriptSource = vendorScript || '';
        this.mainScriptSource = script || DEFAULT_RENDERER_SCRIPT;
        this.bodyAttributes = bodyAttributes || '';
        this.root = root || 'root',
        this.content = content;
        this.windowSizerScript = windowSizerScript || DEFAULT_WINDOW_SIZER_SCRIPT;
        this.defaultPreloadedReduxState = DEFAULT__PRELOADED_REDUX_STATE__;
        this.reduxState = this.safeStore(store) || DEFAULT_RENDERER_REDUX_STATE;
        this.defaultPreloadedPluridState = DEFAULT__PRELOADED_PLURID_STATE__;
        this.pluridState = DEFAULT_RENDERER_PLURID_STATE;
        this.bodyScripts = '';
    }

    public html() {
        return template({
            htmlLanguage: this.htmlLanguage,
            htmlAttributes: this.htmlAttributes,
            head: this.head,
            defaultStyle: this.defaultStyle,
            styles: this.styles,
            headScripts: this.headScripts,
            vendorScriptSource: this.vendorScriptSource,
            mainScriptSource: this.mainScriptSource,
            bodyAttributes: this.bodyAttributes,
            root: this.root,
            content: this.content,
            windowSizerScript: this.windowSizerScript,
            defaultPreloadedReduxState: this.defaultPreloadedReduxState,
            reduxState: this.reduxState,
            defaultPreloadedPluridState: this.defaultPreloadedPluridState,
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
