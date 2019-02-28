import React, { Component } from 'react';
import styled from 'styled-components';
import PluridRoot from '../Root';

import { PluridContext } from '../context';

const StyledPluridRoots: any = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
`;

class PluridRoots extends Component {
    private roots: any;

    constructor(props: any) {
        super(props);

        this.roots = React.createRef();

    }

    public componentDidMount() {
        console.log(window.getComputedStyle(this.roots.current).getPropertyValue("transform"));
    }

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
            <PluridContext.Consumer>
                {({roots}) => (
                    <StyledPluridRoots
                        style={
                            {
                                // transform: `translateX(200px) translateY(300px) translateZ(0px) rotateX(${roots.rotX}deg) rotateY(${roots.rotY}deg) rotateZ(0deg) scale(1)`
                                transform: `${roots.matrix3d}`
                            }
                        }
                        ref={this.roots}
                    >
                        {rootChildren}
                    </StyledPluridRoots>
                )}
            </PluridContext.Consumer>
        );
    }
}

export default PluridRoots;
