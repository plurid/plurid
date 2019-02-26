import React, { Component } from 'react';
import styled from 'styled-components';
import PluridSpace from '../Space';

const StyledPluridContainer = styled.div`
    height: 100vh;
`;

class PluridContainer extends Component {
    public render() {
        const { children } = this.props;

        return (
            <StyledPluridContainer>
                <PluridSpace>
                    {children}
                </PluridSpace>
            </StyledPluridContainer>
        );
    }
}

export default PluridContainer;
