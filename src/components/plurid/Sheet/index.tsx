import React, { Component } from 'react';
import styled from 'styled-components';
import PluridContent from '../Content';
import PluridControls from '../Controls';

const StyledPluridContent = styled.div`
    background-color: hsl(220, 40%, 40%);
    padding: 40px;
    padding-top: 80px;
    position: absolute;
    width: 100%;
    transform-style: preserve-3d;
`;


class PluridSheet extends Component {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                <StyledPluridContent>
                    <PluridContent>
                        {children}
                    </PluridContent>
                </StyledPluridContent>
                <PluridControls />
            </React.Fragment>
        );
    }
}

export default PluridSheet;
