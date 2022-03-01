// #region imports
    // #region libraries
    import express from 'express';

    import {
        PluridPreserve,
        PluridRouteMatch,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        getRandomFace,
    } from '~kernel-planes/NotFound/logic';

    import reduxStore from '~kernel-services/state/store';
    // #endregion external
// #endregion imports



// #region module
const preserves: PluridPreserve<
    PluridRouteMatch | undefined,
    express.Request,
    express.Response
>[] = [
    {
        serve: '/',
        onServe: async (
            transmission,
        ) => {
            // preserve /
            return undefined;
        },
    },
    {
        serve: '/not-found',
        onServe: async () => {
            const store = reduxStore({
                general: {
                    notFoundFace: getRandomFace(),
                },
            });

            return {
                providers: {
                    Redux: {
                        store,
                    },
                },
                globals: {
                    __PRELOADED_REDUX_STATE__: JSON.stringify(store.getState()),
                },
            };
        },
    },
];
// #endregion module



// #region exports
export default preserves;
// #endregion exports
