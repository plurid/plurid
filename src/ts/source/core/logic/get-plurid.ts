export function getPlurid() {
    const selectedPluridRoot = document.getElementById((<any> window).pluridScene.meta.activePlurid);
    const selectedPluridSheet = document.getElementById((<any> window).pluridScene.meta.activeSheet);

    return {
        root: selectedPluridRoot,
        sheet: selectedPluridSheet,
    };
}
