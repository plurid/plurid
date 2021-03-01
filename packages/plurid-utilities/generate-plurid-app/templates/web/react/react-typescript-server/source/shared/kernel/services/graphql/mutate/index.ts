import gql from 'graphql-tag';



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
