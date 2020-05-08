import {
    cleanTemplate,
    resolveBackgroundStyle,
} from '../../utilities/template';

import {
    RendererTemplateData,
} from '../../data/interfaces';



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
        defaultPreloadedPluridState,
        pluridState,
        bodyScripts,
    } = data;

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


    const templateString = `
<!DOCTYPE html>
<html lang="${htmlLanguage}" ${htmlAttributes}>
    <head>
        ${head}

        <style>
            ${defaultStyle}
        </style>

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
            window.${defaultPreloadedPluridState} = ${pluridState};
        </script>

        ${bodyScripts}
    </body>
</html>
    `;

    return cleanTemplate(templateString);
}


export default template;
