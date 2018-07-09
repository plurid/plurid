// Sets plurid-theme-dark as default theme on body
// if no theme class currently in use.
(function() {
    const bodyClassList = document.body.classList;
    const theme = pluridScene.metadata.theme;

    if (theme === "night") {
        bodyClassList.add('plurid-theme-night');
        bodyClassList.remove('plurid-theme-dusk');
        bodyClassList.remove('plurid-theme-dawn');
        bodyClassList.remove('plurid-theme-light');
    }

    if (theme === "dusk") {
        bodyClassList.add('plurid-theme-dusk');
        bodyClassList.remove('plurid-theme-night');
        bodyClassList.remove('plurid-theme-dawn');
        bodyClassList.remove('plurid-theme-light');
    }

    if (theme === "dawn") {
        bodyClassList.add('plurid-theme-dawn');
        bodyClassList.remove('plurid-theme-night');
        bodyClassList.remove('plurid-theme-dusk');
        bodyClassList.remove('plurid-theme-light');
    }

    if (theme === "light") {
        bodyClassList.add('plurid-theme-light');
        bodyClassList.remove('plurid-theme-night');
        bodyClassList.remove('plurid-theme-dusk');
        bodyClassList.remove('plurid-theme-dawn');
    }


    if (theme !== "night" || theme !== "dusk" || theme !== "dawn" ||  theme !== "light") {
        let themeSet = false;

        for (const bodyClass of bodyClassList) {
            if (/plurid-theme/.test(bodyClass)) {
                themeSet = true;
            }
        }

        if (!themeSet) {
            bodyClassList.add('plurid-theme-dusk');
        }
    }
}());
