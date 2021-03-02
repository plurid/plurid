import React from 'react';



const wrapping = (
    WrappedComponent: any,
    WrappeeComponent: any,
    properties: any,
) => {
    return class extends React.Component {
        constructor(props: any) {
            super(props);
        }

        render() {
            return (
                <WrappedComponent
                    {...properties}
                >
                    <WrappeeComponent />
                </WrappedComponent>
            )
        }
    }
}


export default wrapping;
