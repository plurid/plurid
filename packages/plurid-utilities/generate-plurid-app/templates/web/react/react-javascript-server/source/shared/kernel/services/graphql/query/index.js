// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module
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
// #endregion module
