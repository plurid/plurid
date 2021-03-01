import {
    cleanTemplate,
} from '../../utilities/template';



export const NOT_FOUND_TEMPLATE = cleanTemplate(`
<!DOCTYPE html>
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
`);


export const SERVER_ERROR_TEMPLATE = cleanTemplate(`
<!DOCTYPE html>
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
`);
