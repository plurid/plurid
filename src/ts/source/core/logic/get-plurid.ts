export function getPlurid(event = null) {
    const root = document.getElementById((<any> window).pluridScene.meta.activePlurid);
    const sheet = document.getElementById((<any> window).pluridScene.meta.activeSheet);

    return {
        root,
        sheet,
    };
}
