import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';



const PLURID_API_URL = 'http://localhost:33600/graphql';


const client = new ApolloClient({
    link: createHttpLink({
        uri: PLURID_API_URL,
        credentials: 'include',
    }),
    cache: new InMemoryCache(),
});


export default client;
