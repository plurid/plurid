import gql from 'graphql-tag';



export const GET_ACCESS_CODE_TOKENS = gql`
    query GetAccessCodeTokens($input: InputValueString!) {
        getAccessCodeTokens(input: $input) {
            status
            errors {
                path
                type
                message
            }
            data {
                token
                refreshToken
            }
        }
    }
`;
