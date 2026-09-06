// #region imports
    // #region external
    import {
        cleanTemplate,
        globalsInjector,
        safeStore,
    } from '~utilities/template';

    import {
        RendererTemplateData,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
/**
 * The viewport a page gets unless its document declares one: without it a phone lays the page out at
 * 980 px and shrinks it, every plane a thumbnail (2026-09-06).
 */
export const DEFAULT_VIEWPORT_META = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';

const template = async (
    data: RendererTemplateData,
) => {
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
        root,
        content,
        defaultPreloadedPluridMetastate,
        pluridMetastate,
        globals,
        minify,
    } = data;

    const injectedGlobals = globalsInjector(globals);

    const templateString = `
<!DOCTYPE html>
<html lang="${htmlLanguage}" ${htmlAttributes}>
    <head>
        ${head}
        ${/name=["']viewport["']/.test(head) ? '' : DEFAULT_VIEWPORT_META}

        ${defaultStyle && (
            `<style>
                ${defaultStyle}
            </style>`
        )}

        ${styles}

        ${headScripts.join('\n')}

        ${vendorScriptSource ? `<script src="${vendorScriptSource}"></script>` : ''}
        <script defer src="${mainScriptSource}"></script>
    </head>
    <body ${bodyAttributes}>
        <div id="${root}">${content}</div>

        <script>
            ${injectedGlobals}
            window.${defaultPreloadedPluridMetastate} = ${safeStore(pluridMetastate)};
        </script>

        ${bodyScripts.join('\n')}
    </body>
</html>
    `;

    if (!minify) {
        return templateString;
    }

    return cleanTemplate(templateString);
}
// #endregion module



// #region exports
export default template;
// #endregion exports
