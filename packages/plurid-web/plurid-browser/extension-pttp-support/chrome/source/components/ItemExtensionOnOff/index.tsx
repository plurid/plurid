import React from 'react';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    universal,
} from '@plurid/plurid-ui-components-react';

import {
    StyledItemExtensionOnOff,
} from './styled';



const {
    inputs: {
        Switch: PluridSwitch,
    },
} = universal;

export interface ItemExtensionOnOffProperties {
    theme: Theme;
    extensionOnOff: boolean;
    setExtensionOnOff: () => void;
}

const ItemExtensionOnOff: React.FC<ItemExtensionOnOffProperties> = (
    properties,
) => {
    /** properties */
    const {
        theme,
        extensionOnOff,
        setExtensionOnOff,
    } = properties;


    /** render */
    return (
        <StyledItemExtensionOnOff
            theme={theme}
        >
            <div>
                PTTP is {extensionOnOff ? 'on' : 'off'}
            </div>

            <PluridSwitch
                theme={theme}
                checked={extensionOnOff}
                atChange={() => setExtensionOnOff()}
                exclusive={true}
                level={2}
            />
        </StyledItemExtensionOnOff>
    );
}


export default ItemExtensionOnOff;
