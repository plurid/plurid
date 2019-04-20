import React, { Component } from 'react';
import styled from 'styled-components';

const StyledPluridRoot: any = styled.div`
    position: absolute;
    width: 100%;
    transform-style: preserve-3d;
    transform: translateX(0px) translateY(${ props => (props as any).yPos }px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
`;

class PluridRoot extends Component {
    public render() {
        const { children } = this.props;

        return (
            <StyledPluridRoot yPos={Math.round(Math.random()) * 150 * 0 }>
                {children}
            </StyledPluridRoot>
        );
    }
}

export default PluridRoot;
