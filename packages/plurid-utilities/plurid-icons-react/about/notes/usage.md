Track the interactions of an anonymous

    // the user visits a page '/button' which has a "Click Me" button

    import React, {
        useEffect,
    } from 'react';
    import Desit from '@plurid/desit-react';

    const desit = new Desit(
        {
            appID: 'DESIT_APP_ID',
        },
    );

    const Button: React.FC<any> = () => {
        useEffect(() => {
            desit.visit('/button');
        }, []);

        const handleClick = () => {
            desit.interact(
                'click',
                Button,
                {
                    path: '/button',
                }
            );

            console.log('clicked');
        }

        return (
            <button
                onClick={handleCLick}
            >
                Click Me
            </button>
        );
    }

    export default Button;



Track the interactions of a registered, logged in user which has an `user.id`. The `id` is provided from properties and can be specific only for the desit tracking or can be the general user id, depending on the system architecture.

    // the user visits a page '/button' which has a "Click Me" button

    import React, {
        useEffect,
    } from 'react';
    import Desit from '@plurid/desit-react';

    const desit = new Desit(
        {
            appID: 'DESIT_APP_ID',
        },
    );

    const Button: React.FC<any> = (properties) => {
        const {
            user,
        } = properties;

        useEffect(() => {
            desit.visit(
                '/button',
                {
                    userID: user.id,
                },
            );
        }, []);

        const handleClick = () => {
            desit.interact(
                'click',
                Button,
                {
                    userID: user.id,
                    path: '/button',
                }
            );

            console.log('clicked');
        }

        return (
            <button
                onClick={handleCLick}
            >
                Click Me
            </button>
        );
    }

    export default Button;
