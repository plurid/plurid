import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import fetch from 'cross-fetch';

import {
    PLURID_API_URL_GRPAHQL,
} from '../../../data/constants';



export const authenticationClient = (data: any) => new ApolloClient({
    link: createHttpLink({
        uri: PLURID_API_URL_GRPAHQL,
        credentials: 'include',
        fetch,
        headers: {
            'Authorization': 'Bearer ' + data.token,
            'Authorization-Refresh': 'Bearer ' + data.refreshToken,
        },
    }),
    cache: new InMemoryCache(),
});


const client = new ApolloClient({
    link: createHttpLink({
        uri: PLURID_API_URL_GRPAHQL,
        credentials: 'include',
        fetch,
    }),
    cache: new InMemoryCache(),
});


export default client;
