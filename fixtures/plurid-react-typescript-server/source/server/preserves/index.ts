// #region imports
    // #region libraries
    import {
        PluridPreserve,
    } from '@plurid/plurid-react';
    // #endregion libraries
// #endregion imports



// #region module
const preserves: PluridPreserve[] = [
    {
        serve: '/',
        onServe: async (
            transmission,
        ) => {
            const {
                context,
                // response,
                // request,
            } = transmission;

            const {
                path,
                contextualizers,
            } = context;

            // custom logic for the server preserve of '/'

            return {
                providers: {},
            };
        },
    },
];
// #endregion module



// #region exports
export default preserves;
// #endregion exports
