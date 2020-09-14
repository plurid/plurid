import styled from 'styled-components';



interface IStyledSpaces {
    alignment: any;
    snapType: any;
}

export const StyledSpaces = styled.div<IStyledSpaces>`
    scroll-snap-type: ${(properties: IStyledSpaces) => {
        const {
            alignment,
            snapType,
        } = properties;

        if (snapType === 'none') {
            return 'none';
        }

        return alignment + ' ' + snapType;
    }};

    flex-direction: ${(properties: IStyledSpaces) => {
        const {
            alignment,
        } = properties;

        if (alignment === 'x') {
            return 'row';
        }

        return 'column';
    }};

    outline: none;
    overflow: auto;
    display: flex;
    height: 100vh;
    height: -webkit-fill-available;
    width: 100vw;
`;
