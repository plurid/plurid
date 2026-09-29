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
    private minify: boolean;

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
            minify,
        } = configuration;

        const {
            gradientBackground,
            gradientForeground,
        // The metastate carries `themes.general` (see `serverComputeMetastate`), so the SSR'd background
        // gradient matches the active theme; `resolveBackgroundStyle` falls back to a default if it can't parse.
        } = resolveBackgroundStyle(pluridMetastate || '');

        // THE PAGE SIZES THE SPACE: the engine's view is `height: 100%` of its mount point and sizes
        // nothing above it. With only `body` given a height, `html` and the root were auto, the view
        // resolved to 0 px, and the server's page painted black until the script ran; the engine then
        // measured an empty view and fell back to the window (2026-09-29).
        const defaultStyleBasic = `
            html, body, [id="${root || DEFAULT_RENDERER_ROOT}"] {
                height: 100%;
            }

            body {
                background: radial-gradient(ellipse at center, ${gradientBackground} 0%, ${gradientForeground} 100%);
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
        // `??` (not `||`) so an explicit empty string is preserved as "no vendor
        // chunk" (single-bundle builds) and the template skips the `<script>`;
        // `undefined` still falls back to the default `/vendor.js`.
        this.vendorScriptSource = vendorScriptSource ?? DEFAULT_RENDERER_VENDOR_SCRIPT_SOURCE;
        this.mainScriptSource = mainScriptSource || DEFAULT_RENDERER_MAIN_SCRIPT_SOURCE;
        this.root = root || DEFAULT_RENDERER_ROOT;
        this.content = assetsPathRewrite(content) || '';
        this.defaultPreloadedPluridMetastate = defaultPreloadedPluridMetastate || DEFAULT__PRELOADED_PLURID_METASTATE__;
        this.pluridMetastate = pluridMetastate || DEFAULT_RENDERER_PLURID_STATE;
        this.globals = globals ?? {};
        this.minify = minify ?? true;
    }

    public async html() {
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
            minify: this.minify,
        };

        return template(data);
    }
}
// #endregion module



// #region exports
export default PluridRenderer;
// #endregion exports
