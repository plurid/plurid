import fetch from 'cross-fetch';

import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
} from '@apollo/client';

import {
    GRAPHQL_API,
} from '../../../data/constants';



const client = new ApolloClient({
    link: createHttpLink({
        uri: GRAPHQL_API,
        credentials: 'include',
        fetch,
    }),
    cache: new InMemoryCache(),
});


export default client;
