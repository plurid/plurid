import environment from '../../services/utilities/environment';



export const PLURID_API_URL_GRPAHQL = environment.production
    ? 'https://api.plurid.com/graphql/'
    : environment.development
        ? 'https://api.plurid.dev/graphql/'
        : 'http://localhost:33600/graphql/';
