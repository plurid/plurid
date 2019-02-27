import React, { Component } from 'react';
import styled from 'styled-components';
import PluridRoots from '../Roots';

const StyledPluridSpace = styled.div`
    display: block;
    transform: translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
    transform-style: preserve-3d;
    perspective: 1000px;
    perspective-origin: center 300px;
`;

class PluridSpace extends Component {
    public render() {
        const { children } = this.props;

        return (
            <StyledPluridSpace>
                <PluridRoots>
                    {children}
                </PluridRoots>
            </StyledPluridSpace>
        );
    }
}

export default PluridSpace;
