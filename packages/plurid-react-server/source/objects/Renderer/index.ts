import {
    DEFAULT_RENDERER_REDUX_STATE,
    DEFAULT_RENDERER_PLURID_STATE,
    DEFAULT_RENDERER_MAIN_SCRIPT_SOURCE,
    DEFAULT_RENDERER_VENDOR_SCRIPT_SOURCE,
    DEFAULT_WINDOW_SIZER_SCRIPT,
    DEFAULT__PRELOADED_REDUX_STATE__,
    DEFAULT__PRELOADED_PLURID_METASTATE__,
} from '../../data/constants';

import {
    PluridRendererConfiguration,
    RendererTemplateData,
} from '../../data/interfaces';

import {
    recordToString,
    resolveBackgroundStyle,
    assetsPathRewrite,
    safeStore,
} from '../../utilities/template';

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
    private defaultPreloadedPluridMetastate: string;
    private pluridMetastate: string;
    private bodyScripts: string;

    constructor(
        configuration: PluridRendererConfiguration,
    ) {
        const {
            htmlLanguage,
            htmlAttributes,
            head,
            defaultStyle,
            styles,
            headScripts,
            vendorScriptSource,
            mainScriptSource,
            bodyAttributes,
            content,
            root,
            windowSizerScript,
            defaultPreloadedReduxState,
            reduxState,
            defaultPreloadedPluridMetastate,
            pluridMetastate,
            bodyScripts,
        } = configuration;

        const {
            gradientBackground,
            gradientForeground,
        } = resolveBackgroundStyle(reduxState);

        const defaultStyleBasic = `
            body {
                background: radial-gradient(ellipse at center, ${gradientBackground} 0%, ${gradientForeground} 100%);
                height: 100%;
                margin: 0;
            }
        `;

        this.htmlLanguage = htmlLanguage || 'en';
        this.htmlAttributes = recordToString(htmlAttributes) || '';
        this.head = head || '';
        this.defaultStyle = defaultStyle ?? defaultStyleBasic;
        this.styles = styles;
        this.headScripts = headScripts ?? '';
        this.vendorScriptSource = vendorScriptSource || DEFAULT_RENDERER_VENDOR_SCRIPT_SOURCE;
        this.mainScriptSource = mainScriptSource || DEFAULT_RENDERER_MAIN_SCRIPT_SOURCE;
        this.bodyAttributes = bodyAttributes || '';
        this.root = root || 'root';
        this.content = assetsPathRewrite(content) || '';
        this.windowSizerScript = windowSizerScript ?? DEFAULT_WINDOW_SIZER_SCRIPT;
        this.defaultPreloadedReduxState = defaultPreloadedReduxState || DEFAULT__PRELOADED_REDUX_STATE__;
        this.reduxState = safeStore(reduxState) || DEFAULT_RENDERER_REDUX_STATE;
        this.defaultPreloadedPluridMetastate = defaultPreloadedPluridMetastate || DEFAULT__PRELOADED_PLURID_METASTATE__;
        this.pluridMetastate = pluridMetastate || DEFAULT_RENDERER_PLURID_STATE;
        this.bodyScripts = bodyScripts ?? '';
    }

    public html() {
        const data: RendererTemplateData = {
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
            defaultPreloadedPluridMetastate: this.defaultPreloadedPluridMetastate,
            pluridMetastate: this.pluridMetastate,
            bodyScripts: this.bodyScripts,
        };

        return template(data);
    }
}
