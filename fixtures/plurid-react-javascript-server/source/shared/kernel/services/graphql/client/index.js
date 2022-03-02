// #region imports
    // #region libraries
    import fetch from 'cross-fetch';

    import {
        ApolloClient,
        createHttpLink,
        InMemoryCache,
    } from '@apollo/client';
    // #endregion libraries


    // #region external
    import {
        GRAPHQL_API,
    } from '~kernel-data/constants';
    // #endregion external
// #endregion imports



// #region module
const client = new ApolloClient({
    link: createHttpLink({
        uri: GRAPHQL_API,
        credentials: 'include',
        fetch,
    }),
    cache: new InMemoryCache(),
});
// #endregion module



// #region exports
export default client;
// #endregion exports
