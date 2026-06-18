// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledInputSwitch {
    compact?: boolean;
}

export const StyledInputSwitch = styled.div<IStyledInputSwitch>`
    font-size: 0.9rem;

    margin-top: ${
        ({
            compact,
        }: IStyledInputSwitch) => {
            if (compact) {
                return '1rem';
            }

            return '2.2rem';
        }
    };
`;
// #endregion module
