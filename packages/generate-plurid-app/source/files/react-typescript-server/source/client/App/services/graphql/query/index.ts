import gql from 'graphql-tag';



export const CURRENT_USER = gql`
    query CurrentUser {
        currentUser {
            status
            errors {
                type
                path
                message
            }
            data {
                username
            }
        }
    }
`;
