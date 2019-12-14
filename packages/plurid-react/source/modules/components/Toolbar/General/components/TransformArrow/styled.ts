import styled from 'styled-components';



export const StyledTransformArrow: any = styled.div`
    user-select: none;
    cursor: pointer;
    border-radius: 50px;
    width: 25px;
    height: 25px;
    display: grid;
    place-content: center;
    padding: 2px;
    background-color: ${(props: any) => {
        if (props.pressed) {
            return props.theme.backgroundColorTertiary;
        }
        return 'initial';
    }};

    :hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }
`;
