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
            // preserve /
        },
    },
    {
        serve: '/not-found',
        onServe: async () => {
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
