import React from 'react';

import {
    PluridSwitch,
} from '@plurid/plurid-ui-react';



interface OptionsProperties {
    viewMain: any;
    setViewMain: any;
    theme: any;
    // viewMain: boolean;
    // setViewMain: (value: boolean) => void;
}

const Options: React.FC<OptionsProperties> = (properties) => {
    const {
        viewMain,
        setViewMain,
        theme,
    } = properties;

    return (
        <div
            style={{
                width: '100%',
                color: 'black',
                margin: 10,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <PluridSwitch
                theme={theme}
                checked={viewMain}
                atChange={() => setViewMain(!viewMain)}
                exclusive={true}
            />

            <div
                style={{
                    userSelect: 'none',
                    cursor: 'pointer',
                    margin: '0 1rem',
                }}
                onClick={() => setViewMain(!viewMain)}
            >
                View Main Colors
            </div>
        </div>
    );
}


export default Options;
