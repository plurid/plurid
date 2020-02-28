import React from 'react';



const wrapping = (
    WrapperComponent: any | undefined,
    WrappeeComponent: any,
    wrapperProperties?: any,
    wrappeeProperties?: any,
) => {
    if (WrapperComponent) {
        return (
            <WrapperComponent
                {...wrapperProperties}
            >
                <WrappeeComponent
                    {...wrappeeProperties}
                />
            </WrapperComponent>
        );
    }

    return (
        <WrappeeComponent
            {...wrappeeProperties}
        />
    );
}


export default wrapping;
