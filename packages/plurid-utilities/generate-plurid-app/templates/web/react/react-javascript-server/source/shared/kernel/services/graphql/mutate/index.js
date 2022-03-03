// #region imports
    // #region libraries
    import gql from 'graphql-tag';
    // #endregion libraries
// #endregion imports



// #region module
export const UPDATE_USER = gql`
    mutation UpdateUser($input: InputUpdateUser!) {
        updateUser(input: $input) {
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
