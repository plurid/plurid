import styled from 'styled-components';

import {
    universal,
} from '@plurid/plurid-ui-components-react';



const {
    inputs: {
        Textline: PluridTextline,
    },
} = universal;


export const StyledPluridTextline = styled(PluridTextline)`
    input {
        text-align: right;
    }
`;

export const StyledOptions: any = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorPrimary;
    }};
    color: ${(props: any) => {
        return props.theme.colorPrimary;
    }};

    height: 500px;
    width: 100%;
    margin: 0px auto;
    user-select: none;
    overflow: hidden;

    h2 {
        font-size: 1.4rem;
    }
`;


export const StyledOptionsContainer: any = styled.div`
    width: 100%;
    height: 500px;
    display: grid;
    align-items: center;
    justify-content: center;
    overflow: auto;
`;


export const StyledOptionsWrapper: any = styled.div`
    width: 280px;
    margin: 30px auto;
`;


export const StyledOptionsItemLeftRight = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 15px 0;
`;


export const StyledStateContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;

    margin-top: 20px;
    margin-bottom: 20px;
`;

export const StyledUIContainer = styled.div`
    margin-top: 50px;
    margin-bottom: 20px;
`;
