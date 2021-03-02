import styled from 'styled-components';



export const StyledButtonCheckmark = styled.div`
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-family: 'Ubuntu', 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
        'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
`;


export const StyledButtonCheckmarkCheckbox: any = styled.div`
    box-sizing: border-box;
    display: block;
    height: 13px;
    width: 13px;
    border-radius: 50%;
    border: 2px solid ${props => props.theme.colorPrimary};
    background-color: ${(props: any) => {
        if (props.isChecked) {
            return props.theme.colorPrimary;
        }
        return 'transparent';
    }};
`;
