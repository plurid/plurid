import React, { useState } from 'react';
import './App.css';

import themes, { Theme } from '@plurid/plurid-themes';

import ThemePicker from './components/ThemePicker';
import Options from './components/Options';
import Stripe from './components/Stripe';
import Nary from './components/Nary';
import Shadows from './components/Shadows';



const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(themes.depict);
    const [viewMain, setViewMain] = useState(false);

    return (
        <div className="App"
            style={{
                color: theme.colorPrimary,
                // background: theme.backgroundColorPrimary,
            }}
        >
            <div
                style={{
                    position: 'fixed',
                    width: '100%',
                    background: 'white',
                    boxShadow: theme.boxShadowUmbra,
                }}
            >
                <ThemePicker
                    theme={theme.name}
                    themes={themes}
                    setTheme={setTheme}
                />

                <Options
                    theme={theme}
                    viewMain={viewMain}
                    setViewMain={setViewMain}
                />
            </div>

            <div style={{ height: 140 }} />

            <Stripe
                text="theme.baseColor"
                backgroundColor={theme.baseColor}
                color={theme.colorPrimary}
            />

            {!viewMain && (
                <Stripe
                    text="theme.baseColorInverted"
                    backgroundColor={theme.baseColorInverted}
                    color={theme.colorPrimaryInverted}
                />
            )}

            <Stripe
                text="theme.backgroundColorDark"
                backgroundColor={theme.backgroundColorDark}
                color={theme.type === 'bright'
                    ? theme.colorPrimaryInverted
                    : theme.colorPrimary}
            />

            <Stripe
                text="theme.backgroundColorBright"
                backgroundColor={theme.backgroundColorBright}
                color={theme.type === 'bright'
                    ? theme.colorPrimary
                    : theme.colorPrimaryInverted}
            />

            <Nary
                theme={theme}
                type="Primary"
                viewMain={viewMain}
            />

            <Nary
                theme={theme}
                type="Secondary"
                viewMain={viewMain}
            />

            <Nary
                theme={theme}
                type="Tertiary"
                viewMain={viewMain}
            />

            <Nary
                theme={theme}
                type="Quaternary"
                viewMain={viewMain}
            />

            <Shadows
                theme={theme}
            />
        </div>
    );
}


export default App;
