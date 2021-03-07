// #region imports
    // #region external
    import {
        cleanTemplate,
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
        htmlAttributes,
        head,
        defaultStyle,
        styles,
        headScripts,
        vendorScriptSource,
        mainScriptSource,
        bodyAttributes,
        root,
        content,
        windowSizerScript,
        defaultPreloadedReduxState,
        reduxState,
        defaultPreloadedPluridMetastate,
        pluridMetastate,
        bodyScripts,
    } = data;

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

        ${headScripts}

        <script src="${vendorScriptSource}"></script>
        <script defer src="${mainScriptSource}"></script>
    </head>
    <body ${bodyAttributes}>
        <div id="${root}">${content}</div>

        <script>
            ${windowSizerScript}
        </script>
        <script>
            window.${defaultPreloadedReduxState} = ${reduxState};
            window.${defaultPreloadedPluridMetastate} = ${pluridMetastate};
        </script>

        ${bodyScripts}
    </body>
</html>
    `;

    return cleanTemplate(templateString);
}
// #endregion module



// #region exports
export default template;
// #endregion exports
