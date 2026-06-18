// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledItemsline {
    theme: Theme,
    level: number;
    left: boolean;
}

export const StyledItemsline = styled.div<IStyledItemsline>`
    padding: 0 0.7rem;
    font-size: 0.9rem;

    ul {
        list-style: none;
        padding: 0;
        margin-top: 0.4rem;
        margin-bottom: 0.8rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        flex-direction: ${(props: IStyledItemsline) => {
            if (props.left) {
                return 'row';
            }
            return 'row-reverse';
        }};
    }

    li {
        margin: 0 0.3rem;
        cursor: pointer;
        user-select: none;
        line-height: 1.2rem;

        :hover {
            text-decoration: line-through;
        }
    }
`;
// #endregion module
