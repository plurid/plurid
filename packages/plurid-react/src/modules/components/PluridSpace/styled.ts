import styled from 'styled-components';



export const StyledPluridSpace: any = styled.div`
    position: relative;
    height: 100%;
    perspective: 2000px;
    background: radial-gradient(ellipse at center, ${(props: any) => {
        if (props.theme.type === 'dark') {
            return props.theme.backgroundColorSecondary;
        } else {
            return props.theme.backgroundColorPrimary;
        }
    }} 0%, ${(props: any) => {
        if (props.theme.type === 'dark') {
            return props.theme.backgroundColorPrimary;
        } else {
            return props.theme.backgroundColorSecondary;
        }
    }} 100%);
`;
