import React, { Component } from 'react';
import styled from 'styled-components';



const StyledPluridLink = styled.a`
    color: hsl(0, 0%, 80%);
    user-select: none;
    cursor: pointer;

    :hover {
        color: white;
        text-decoration: underline;
    }
`;


export interface IPluridLinkProps {
    page: string;
    follow?: boolean; // opens the link in the same PluridSheet (default false)
    newTab?: boolean; // opens the link in a new tab (default false)
}


class PluridLink extends Component<IPluridLinkProps, {}> {
    public static defaultProps = {
        follow: false,
        newTab: false,
    }

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
