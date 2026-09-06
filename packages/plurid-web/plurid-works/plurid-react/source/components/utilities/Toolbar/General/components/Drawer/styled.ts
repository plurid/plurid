// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridDrawer: any = styled.div`
    margin: 0 0 2px;
    border-radius: var(--plurid-radius);
    padding-bottom: ${(props: any) => (props.toggled ? '6px' : '0')};
    background-color: ${(props: any) => (props.toggled ? 'var(--plurid-hover)' : 'transparent')};
    color: var(--plurid-ink);
    transition: background-color 150ms var(--plurid-ease);

    h5 {
        font-size: var(--plurid-font-size);
        font-weight: 600;
        margin: 0;
    }
`;


/** A row: the drawer's name, a hover wash, no reflow. */
export const StyledPluridDrawerHeading: any = styled.div`
    user-select: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    min-height: 36px;
    padding: 0 12px;
    border-radius: var(--plurid-radius);
    text-align: left;
    transition: background-color 150ms var(--plurid-ease);

    &:hover {
        background-color: var(--plurid-hover);
    }
`;


export const StyledPluridDrawerItems = styled.div`
    padding: 2px 12px 4px;
    font-size: var(--plurid-font-size);
`;
// #endregion module
