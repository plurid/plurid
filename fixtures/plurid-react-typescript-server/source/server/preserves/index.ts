// #region imports
    // #region libraries
    import {
        PluridPreserve,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        getRandomFace,
    } from '~kernel-planes/NotFound/logic';
    // #endregion external
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
    {
        serve: '/not-found',
        onServe: async (
            transmission,
        ) => {
            return {
                providers: {
                    redux: {
                        general: {
                            notFoundFace: getRandomFace(),
                        },
                    },
                },
            };
        },
    },
];
// #endregion module



// #region exports
export default preserves;
// #endregion exports
