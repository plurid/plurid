import styled from 'styled-components';



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
`;
