// #region imports
    // #region external
    import {
        cleanTemplate,
        globalsInjector,
    } from '~utilities/template';

    import {
        RendererTemplateData,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const template = (
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

        ${defaultStyle && (
            `<style>
                ${defaultStyle}
            </style>`
        )}

        ${styles}

        ${headScripts.join('\n')}

        <script src="${vendorScriptSource}"></script>
        <script defer src="${mainScriptSource}"></script>
    </head>
    <body ${bodyAttributes}>
        <div id="${root}">${content}</div>

        <script>
            ${injectedGlobals}
            window.${defaultPreloadedPluridMetastate} = ${pluridMetastate};
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
