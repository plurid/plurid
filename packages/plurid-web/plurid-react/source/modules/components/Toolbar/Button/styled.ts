import styled from 'styled-components';



export const StyledToolbarButton: any = styled.div`
    position: relative;
    cursor: pointer;
    height: 40px;
    display: grid;
    place-content: center;
    transition: transform 50ms ease-in-out;

    border-top-left-radius: ${(props: any) => {
        if (props.first) {
            return '15px';
        }
        return '0';
    }};
    border-top-right-radius: ${(props: any) => {
        if (props.first) {
            return '15px';
        }
        return '0';
    }};

    border-bottom-left-radius: ${(props: any) => {
        if (props.last) {
            return '15px';
        }
        return '0';
    }};
    border-bottom-right-radius: ${(props: any) => {
        if (props.last) {
            return '15px';
        }
        return '0';
    }};

    background-color: ${(props: any) => {
        if (props.active) {
            return props.theme.backgroundColorTertiary;
        }
        return 'transparent';
    }};

    :hover {
        background: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }

    :hover svg {
        transform: ${(props: any) => {
            if (props.scaleImage) {
                return 'scale(1.2)';
            }
            return '';
        }};
    }

    svg {
        transition: transform 100ms linear;
        width: 15px;
        height: 15px;
        fill: ${(props: any) => {
            return props.theme.colorPrimary;
        }};
        transform: ${(props: any) => {
            if (props.active && props.scaleImage) {
                return 'scale(1.2)';
            }
            return '';
        }};
    }
`;


export const StyledToolbarButtonText: any = styled.div`
    left: ${(props: any) => {
        if (props.textLeft) {
            return '-88px';
        }
        return '30px';
    }};
    justify-content: ${(props: any) => {
        if (props.textLeft) {
            return 'flex-end';
        }
        return 'left';
    }};
    text-align: ${(props: any) => {
        if (props.textLeft) {
            return 'right';
        }
        return 'left';
    }};
    padding-left: ${(props: any) => {
        if (props.textLeft) {
            return '0';
        }
        return '8px';
    }};

    position: absolute;
    height: 40px;
    width: 80px;
    display: flex;
    align-items: center;
`;
