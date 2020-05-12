import styled, {
    css,
    keyframes,
} from 'styled-components';



const fadeIn = keyframes`
    from {
        opacity: 0%;
    }

    to {
        opacity: 100%;
    }
`;


export const StyledPluridSpace: any = styled.div`
    position: relative;
    height: 100%;
    overflow: hidden;
    perspective: 2000px;
    outline: none;
    background: ${(props: any) => {
        if (props.opaque) {
            const foregroundGradient = props.theme.type === 'dark'
                ? props.theme.backgroundColorTertiary
                : props.theme.backgroundColorPrimary;
            const backgroundGradient = props.theme.type === 'dark'
                ? props.theme.backgroundColorPrimary
                : props.theme.backgroundColorTertiary;

            return `radial-gradient(
                ellipse at center,
                ${foregroundGradient} 0%,
                ${backgroundGradient} 100%)
            `;
        }

        return 'transparent';
    }};

    opacity: 0%;
    animation: ${(props: any) => {
        if (props.isMounted) {
            return css`${fadeIn} 250ms linear forwards`;
        }

        return '';
    }};
`;
