import React, { Component } from 'react';
import styled from 'styled-components';
import PluridRoot from "../Root";

const StyledPluridRoots = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(45deg) rotateZ(0deg) scale(1);
`;

class PluridRoots extends Component {
    public render() {
        const { children } = this.props;

        const rootChildren = React.Children.map(children, child => {
            const newChild = (
                <PluridRoot>
                    {child}
                </PluridRoot>
            );
            return newChild;
        });

        return (
            <StyledPluridRoots>
                {rootChildren}
            </StyledPluridRoots>
        );
    }
}

export default PluridRoots;
