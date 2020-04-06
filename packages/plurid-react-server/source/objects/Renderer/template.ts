import {
    cleanTemplate,
} from '../../utilities/template';



const template = (
    head: string,
    styles: string,
    content: string,
    store: string,
    root: string,
    script: string,
    vendorScript: string,
    stripeScript: string,
    htmlAttributes: string,
    bodyAttributes: string,
) => {
    const templateString = `
<!DOCTYPE html>
<html lang="en">
    <head ${htmlAttributes}>
        ${head}

        <style>
            html { background:black; }
        </style>

        ${styles}

        ${stripeScript}

        <script src="${vendorScript}"></script>
        <script defer src="${script}"></script>
    </head>
    <body ${bodyAttributes}>
        <div id="${root}">${content}</div>
        <script>
            window.__PRELOADED_STATE__ = ${store}
        </script>
    </body>
</html>
    `;

    return cleanTemplate(templateString);
}


export default template;
