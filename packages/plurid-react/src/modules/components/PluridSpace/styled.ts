import styled from 'styled-components';



export const StyledPluridSpace: any = styled.div`
    position: relative;
    height: 100%;
    overflow: hidden;
    perspective: 2000px;
    background: ${(props: any) => {
        if (props.transparent) {
            return 'transparent';
        }

        const foregroundGradient = props.theme.type === 'dark'
            ? props.theme.backgroundColorSecondary
            : props.theme.backgroundColorPrimary;
        const backgroundGradient = props.theme.type === 'dark'
            ? props.theme.backgroundColorPrimary
            : props.theme.backgroundColorSecondary;

        return `radial-gradient(
            ellipse at center,
            ${foregroundGradient} 0%,
            ${backgroundGradient} 100%)
        `;
    }};

    /* radial-gradient(ellipse at center, ${(props: any) => {
        if (props.transparentBackground) {
            return 'transparent';
        }

        if (props.theme.type === 'dark') {
            return props.theme.backgroundColorSecondary;
        } else {
            return props.theme.backgroundColorPrimary;
        }
    }} 0%, ${(props: any) => {
        if (props.transparentBackground) {
            return 'transparent';
        }

        if (props.theme.type === 'dark') {
            return props.theme.backgroundColorPrimary;
        } else {
            return props.theme.backgroundColorSecondary;
        }
    }} 100%); */
`;
