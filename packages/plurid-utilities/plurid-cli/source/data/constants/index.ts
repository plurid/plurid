import environment from '../../services/utilities/environment';



export const PLURID_API_URL_GRPAHQL = environment.production
    ? 'https://api.plurid.com/graphql/'
    : environment.development
        ? 'https://api.plurid.dev/graphql/'
        : 'http://localhost:33600/graphql/';


export const UPLOAD_HOSTNAME = environment.local
    ? 'localhost'
    : 'upload.plurid.com';

export const UPLOAD_PORT = environment.local
    ? 33601
    : 443;
