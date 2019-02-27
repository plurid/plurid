import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PluridContainer from '../Container';
import PluridSheet from '../Sheet';

export interface IPluridAppProps {
    theme?: string;
}

class PluridApp extends Component<IPluridAppProps> {
    public static propTypes = {
        theme: PropTypes.string,
    }

    public render() {
        const { children } = this.props;

        const sheetChildren = React.Children.map(children, child => {
            const sheetChild = (
                <PluridSheet>
                    {(child as any).props.children}
                </PluridSheet>
            );

            return sheetChild;
        });

        console.log('sheetChildren', sheetChildren);

        return (
            <PluridContainer>
                {sheetChildren}
            </PluridContainer>
        );
    }
}

export default PluridApp;
