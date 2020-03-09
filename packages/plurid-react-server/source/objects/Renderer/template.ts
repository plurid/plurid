const cleanTemplate = (
    template: string,
) => {
    const cleanNewLines = template.replace(/(?:\r\n|\r|\n)/g, ' ');
    const cleanWhitespace = cleanNewLines.replace(/  +/g, ' ');

    return cleanWhitespace;
}


const template = (
    head: string,
    styles: string,
    content: string,
    store: string,
    root: string,
    script: string,
    stripeScript: string,
    htmlAttributes: string,
    bodyAttributes: string,
) => {
    const templateString = `
<!DOCTYPE html>
    <head ${htmlAttributes}>
        ${head}

        <style>
            html { background:black; }
        </style>

        ${styles}

        ${stripeScript}

        <script defer src="./vendor.js"></script>
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
