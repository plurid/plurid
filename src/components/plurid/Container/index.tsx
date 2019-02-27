import React, { Component } from 'react';
import styled from 'styled-components';
import PluridSpace from '../Space';
import PluridOptions from '../Options';
import PluridViewcube from '../Viewcube';

const StyledPluridContainer = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    overflow: hidden;
    height: 100vh;
    color: white;
    background: radial-gradient(ellipse at center, #252727 0%, #111212 100%);
`;

interface IPluridContainerProps {
    onWheel: (event: any) => void;
    onKeyDown: (event: any) => void;
}

class PluridContainer extends Component<IPluridContainerProps, {}> {
    public render() {
        const { children, onWheel, onKeyDown } = this.props;

        return (
            <StyledPluridContainer
                onWheel={onWheel}
                tabIndex={0}
                onKeyDown={onKeyDown}
            >
                <PluridSpace>
                    {children}
                </PluridSpace>
                <PluridOptions />
                <PluridViewcube />
            </StyledPluridContainer>
        );
    }
}

export default PluridContainer;
