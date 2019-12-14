import styled from 'styled-components';



export const StyledToolbarRotate: any = styled.div`
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: ${(props: any) => {
        if (!props.showTransformButtons) {
            return '1fr';
        }

        return '30px 30px 60px 30px 30px';
        // return '0.5fr 0.5fr 1fr 0.5fr 0.5fr';
    }};
`;
