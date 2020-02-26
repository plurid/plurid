const template = (
    head: string,
    content: string,
    store: string,
    script: string,
) => {
    return `
<!doctype html>
    <head>
        ${head}
    </head>
    <body>
        <div id="root">${content}</div>
        <script>
            window.__PRELOADED_STATE__ = ${store}
        </script>
        <script src="${script}"></script>
    </body>
</html>
    `;
}


export default template;
