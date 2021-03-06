// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridLink: any = styled.a`
    /**
     * Forces element to go to the second row if inlined.
     */
    display: inline-block;

    cursor: pointer;
    color: ${(props: any) => {
        return props.theme.colorTertiary;
    }};

    :hover {
        color: ${(props: any) => {
            return props.theme.colorPrimary;
        }};
    }

    ::after {
        content: "${(props: any) => {
            if (!props.devisible) {
                if (props.suffix) {
                    return props.suffix;
                }
                return "'";
            }
            return '';
        }}";
    }
`;
// #endregion module
