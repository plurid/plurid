import fetch from 'cross-fetch';

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

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
