// #region module
/**
 * The built-in 404 and 500 pages: static strings. They were `cleanTemplate(…)` results, and
 * html-minifier-terser's `minify` is async since v7, so both constants were Promises that
 * `response.send` serialized as the JSON `{}` — every unknown URL of an application without a
 * not-found route answered `404 application/json "{}"` (2026-09-29). A static page has nothing to
 * minify at request time.
 */
export const NOT_FOUND_TEMPLATE = `<!DOCTYPE html>
<html>
    <head>
        <title>[404] Not Found</title>
        <style>
            html, body {
                margin: 0;
                background: #242b33;
                color: #ddd;
                user-select: none;
            }

            .not-found {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Ubuntu', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto;
            }
        </style>
    </head>

    <body>
        <div class="not-found">[404] Not Found</div>
    </body>
</html>
`;


export const SERVER_ERROR_TEMPLATE = `<!DOCTYPE html>
<html>
    <head>
        <title>[500] Server Error</title>
        <style>
            html, body {
                margin: 0;
                background: #242b33;
                color: #ddd;
                user-select: none;
            }

            .error {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Ubuntu', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto;
            }
        </style>
    </head>

    <body>
        <div class="error">[500] Server Error</div>
    </body>
</html>
`;
// #endregion module
