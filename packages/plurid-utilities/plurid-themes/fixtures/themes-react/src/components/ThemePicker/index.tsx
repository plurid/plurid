import React from 'react';

import { Theme } from '@plurid/plurid-themes';



interface ThemePickerProperties {
    theme: string,
    themes: any,
    setTheme: (theme: Theme) => void;
}

const ThemePicker: React.FC<ThemePickerProperties> = (properties) => {
    const {
        theme,
        themes,
        setTheme,
    } = properties;

    const themeNames = Object.keys(themes);

    return (
        <div
            style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                color: 'black',
                marginTop: 10,
            }}
        >
            <div
                style={{
                    textAlign: 'center',
                    margin: '0px auto',
                    userSelect: 'none',
                }}
            >
                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '0px auto',
                        display: 'flex',
                        width: '1200px',
                        overflow: 'auto',
                    }}
                >
                    {themeNames.map((themeName: any) => {
                        return (
                            <li
                                style={{
                                    margin: '10px',
                                    cursor: 'pointer',
                                    padding: '5px 0',
                                    borderBottom: themeName === theme ? '2px solid black' : '',
                                }}
                                key={themeName}
                                onClick={() => setTheme((themes as any)[themeName])}
                            >
                                {themeName}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
}


export default ThemePicker;
