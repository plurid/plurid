import * as React from 'react';

export interface IPluridAppProps {
    text?: string;
}

export default class PluridApp extends React.Component<IPluridAppProps> {
    public render() {
        const { text } = this.props;

        return (
            <div>
                Example Component: {text}
            </div>
        );
    }
}
