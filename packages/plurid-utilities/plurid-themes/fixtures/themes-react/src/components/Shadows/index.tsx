import React from 'react';

import { Theme } from '@plurid/plurid-themes';



interface ShadowsProperties {
    theme: Theme;
}

const Shadows: React.FC<ShadowsProperties> = (properties) => {
    const {
        theme,
    } = properties;

    return (
        <div
            style={{
                display: 'grid',
                placeContent: 'center',
                height: '700px',
                width: '100%',
                background: theme.backgroundColorPrimary,
                color: theme.colorPrimary,
            }}
        >
            <h2>
                shadows
            </h2>

            <div
                style={{
                    display: 'grid',
                    placeContent: 'center',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gridGap: '5rem',
                    margin: 50,
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        placeContent: 'center',
                        height: '200px',
                        width: '350px',
                        background: theme.backgroundColorSecondary,
                        color: theme.colorPrimary,
                        boxShadow: theme.boxShadowUmbra
                    }}
                >
                    theme.boxShadowUmbra
                    <br />
                    {theme.boxShadowUmbra}
                </div>

                <div
                    style={{
                        display: 'grid',
                        placeContent: 'center',
                        height: '200px',
                        width: '350px',
                        background: theme.backgroundColorSecondary,
                        color: theme.colorPrimary,
                        boxShadow: theme.boxShadowPenumbra
                    }}
                >
                    theme.boxShadowPenumbra
                    <br />
                    {theme.boxShadowPenumbra}
                </div>

                <div
                    style={{
                        display: 'grid',
                        placeContent: 'center',
                        height: '200px',
                        width: '350px',
                        background: theme.backgroundColorSecondary,
                        color: theme.colorPrimary,
                        boxShadow: theme.boxShadowAntumbra
                    }}
                >
                    theme.boxShadowAntumbra
                    <br />
                    {theme.boxShadowAntumbra}
                </div>

                <div
                    style={{
                        display: 'grid',
                        placeContent: 'center',
                        height: '200px',
                        width: '350px',
                        background: theme.backgroundColorSecondary,
                        color: theme.colorPrimary,
                        boxShadow: theme.boxShadowUmbraInset
                    }}
                >
                    theme.boxShadowUmbraInset
                    <br />
                    {theme.boxShadowUmbraInset}
                </div>

                <div
                    style={{
                        display: 'grid',
                        placeContent: 'center',
                        height: '200px',
                        width: '350px',
                        background: theme.backgroundColorSecondary,
                        color: theme.colorPrimary,
                        boxShadow: theme.boxShadowPenumbraInset
                    }}
                >
                    theme.boxShadowPenumbraInset
                    <br />
                    {theme.boxShadowPenumbraInset}
                </div>

                <div
                    style={{
                        display: 'grid',
                        placeContent: 'center',
                        height: '200px',
                        width: '350px',
                        background: theme.backgroundColorSecondary,
                        color: theme.colorPrimary,
                        boxShadow: theme.boxShadowAntumbraInset
                    }}
                >
                    theme.boxShadowAntumbraInset
                    <br />
                    {theme.boxShadowAntumbraInset}
                </div>
            </div>
        </div>
    );
}


export default Shadows;