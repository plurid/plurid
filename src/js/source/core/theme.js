/**
 * Sets plurid-theme-dusk as default theme on <body>
 * if no theme class currently in use.
 */
(function() {
    const bodyClassList = document.body.classList;
    let themeSet = false;

    for (let bodyClass of bodyClassList) {
        if (/plurid-theme/.test(bodyClass)) {
            themeSet = true;
        }
    }

    if (!themeSet) {
        const defaultTheme = 'dusk';
        setTheme(defaultTheme)
    }
})();


export function setTheme(theme) {
    const bodyClassList = document.body.classList;
    const possibleThemes = [
        'night',
        'dusk',
        'dawn',
        'light'
    ];

    possibleThemes.map(possibleTheme => {
        theme === possibleTheme ? bodyClassList.add(`plurid-theme-${theme}`) : possibleThemes.map(possibleTheme => {
            theme !== possibleTheme ? bodyClassList.remove(`plurid-theme-${possibleTheme}`) : '';
        });
    });
}
