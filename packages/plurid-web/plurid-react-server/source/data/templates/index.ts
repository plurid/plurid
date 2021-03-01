import {
    cleanTemplate,
} from '../../utilities/template';



export const NOT_FOUND_TEMPLATE = cleanTemplate(`
<!DOCTYPE html>
<html>
    <head>
        <title>
            Not Found
        </title>
    </head>
    <body>
        <h1>
            Not Found
        </h1>
    </body>
</html>
`);


export const SERVER_ERROR_TEMPLATE = cleanTemplate(`
<!DOCTYPE html>
<html>
    <head>
        <title>
            Server Error
        </title>
    </head>
    <body>
        <h1>
            Server Error
        </h1>
    </body>
</html>
`);
