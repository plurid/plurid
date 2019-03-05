import React, { Component } from 'react';
import styled from 'styled-components';



const StyledPluridLink = styled.a`
    color: white;
    user-select: none;
    cursor: pointer;

    :hover {
        text-decoration: underline;
    }
`;


export interface IPluridLinkProps {
    page: string;
}


class PluridLink extends Component<IPluridLinkProps, {}> {
    public render() {
        const { children } = this.props;

        return (
            <StyledPluridLink onClick={this.onClick}>
                {children}
            </StyledPluridLink>
        );
    }

    private onClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        console.log('clicked');
    }
}

export default PluridLink;
