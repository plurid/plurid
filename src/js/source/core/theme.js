// Sets plurid-theme-dark as default theme on body
// if no theme class currently in use.
(function() {
    const bodyClassList = document.body.classList;
    let themeSet = false;

    for (const bodyClass of bodyClassList) {
        if (/plurid-theme/.test(bodyClass)) {
            themeSet = true;
        }
    }

    if (!themeSet) {
        setDefaultTheme();
    }
}());


function setDefaultTheme() {
    const bodyClassList = document.body.classList;
    const defaultTheme = pluridScene.metadata.theme;
    const currentThemes = [
        'night',
        'dusk',
        'dawn',
        'light'
    ];

    currentThemes.map(theme => {
        defaultTheme === theme ? bodyClassList.add(`plurid-theme-${theme}`) : currentThemes.map(theme => {
            defaultTheme !== theme ? bodyClassList.remove(`plurid-theme-${theme}`) : '';
        });
    });
}
