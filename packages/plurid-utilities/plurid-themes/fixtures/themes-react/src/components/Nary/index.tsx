import React from 'react';

import Stripe from '../Stripe';

import { Theme } from '@plurid/plurid-themes';



interface NaryProperties {
    theme: Theme;
    type: string;
    viewMain: boolean;
}

const Nary: React.FC<NaryProperties> = (properties) => {
    const {
        type,
        theme,
        viewMain,
    } = properties;

    const backgroundColor = `backgroundColor${type}`;
    const backgroundColorAlpha = backgroundColor + 'Alpha';
    const backgroundColorInverted = backgroundColor + 'Inverted';

    return (
        <div
            style={{
                width: '100%',
            }}
        >
            <Stripe
                text={`theme.${backgroundColor}`}
                backgroundColor={(theme as any)[backgroundColor]}
                color={theme.colorPrimary}
            />

            {!viewMain && (
                <>
                    <Stripe
                        text={`theme.${backgroundColorAlpha}`}
                        backgroundColor={(theme as any)[backgroundColorAlpha]}
                        color={theme.colorPrimary}
                    />

                    <Stripe
                        text={`theme.${backgroundColorInverted}`}
                        backgroundColor={(theme as any)[backgroundColorInverted]}
                        color={theme.colorPrimaryInverted}
                    />
                </>
            )}
        </div>
    );
}


export default Nary;
