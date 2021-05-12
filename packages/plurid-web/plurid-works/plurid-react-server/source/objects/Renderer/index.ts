// #region imports
    // #region external
    import {
        DEFAULT_RENDERER_LANGUAGE,
        DEFAULT_RENDERER_ROOT,
        DEFAULT_RENDERER_PLURID_STATE,
        DEFAULT_RENDERER_MAIN_SCRIPT_SOURCE,
        DEFAULT_RENDERER_VENDOR_SCRIPT_SOURCE,
        DEFAULT__PRELOADED_PLURID_METASTATE__,
    } from '~data/constants';

    import {
        PluridRendererConfiguration,
        RendererTemplateData,
    } from '~data/interfaces';

    import {
        resolveBackgroundStyle,
        assetsPathRewrite,
    } from '~utilities/template';
    // #endregion external


    // #region internal
    import template from './template';
    // #endregion internal
// #endregion imports



// #region module
class PluridRenderer {
    private htmlLanguage: string;
    private head: string;
    private htmlAttributes: string;
    private bodyAttributes: string;
    private defaultStyle: string;
    private styles: string;
    private headScripts: string[];
    private bodyScripts: string[];
    private vendorScriptSource: string;
    private mainScriptSource: string;
    private root: string;
    private content: string;
    private defaultPreloadedPluridMetastate: string;
    private pluridMetastate: string;
    private globals: Record<string, string>;

    constructor(
        configuration: PluridRendererConfiguration,
    ) {
        const {
            htmlLanguage,
            head,
            htmlAttributes,
            bodyAttributes,
            defaultStyle,
            styles,
            headScripts,
            bodyScripts,
            vendorScriptSource,
            mainScriptSource,
            content,
            root,
            defaultPreloadedPluridMetastate,
            pluridMetastate,
            globals,
        } = configuration;

        const {
            gradientBackground,
            gradientForeground,
        // TOFIX
        // } = resolveBackgroundStyle(reduxState);
        } = resolveBackgroundStyle('');

        const defaultStyleBasic = `
            body {
                background: radial-gradient(ellipse at center, ${gradientBackground} 0%, ${gradientForeground} 100%);
                height: 100%;
                margin: 0;
            }
        `;

        this.htmlLanguage = htmlLanguage || DEFAULT_RENDERER_LANGUAGE;
        this.head = head || '';
        this.htmlAttributes = htmlAttributes;
        this.bodyAttributes = bodyAttributes || '';
        this.defaultStyle = defaultStyle ?? defaultStyleBasic;
        this.styles = styles;
        this.headScripts = headScripts;
        this.bodyScripts = bodyScripts;
        this.vendorScriptSource = vendorScriptSource || DEFAULT_RENDERER_VENDOR_SCRIPT_SOURCE;
        this.mainScriptSource = mainScriptSource || DEFAULT_RENDERER_MAIN_SCRIPT_SOURCE;
        this.root = root || DEFAULT_RENDERER_ROOT;
        this.content = assetsPathRewrite(content) || '';
        this.defaultPreloadedPluridMetastate = defaultPreloadedPluridMetastate || DEFAULT__PRELOADED_PLURID_METASTATE__;
        this.pluridMetastate = pluridMetastate || DEFAULT_RENDERER_PLURID_STATE;
        this.globals = globals ?? {};
    }

    public html() {
        const data: RendererTemplateData = {
            htmlLanguage: this.htmlLanguage,
            head: this.head,
            htmlAttributes: this.htmlAttributes,
            bodyAttributes: this.bodyAttributes,
            defaultStyle: this.defaultStyle,
            styles: this.styles,
            headScripts: this.headScripts,
            bodyScripts: this.bodyScripts,
            vendorScriptSource: this.vendorScriptSource,
            mainScriptSource: this.mainScriptSource,
            root: this.root,
            content: this.content,
            defaultPreloadedPluridMetastate: this.defaultPreloadedPluridMetastate,
            pluridMetastate: this.pluridMetastate,
            globals: this.globals,
        };

        return template(data);
    }
}
// #endregion module



// #region exports
export default PluridRenderer;
// #endregion exports
