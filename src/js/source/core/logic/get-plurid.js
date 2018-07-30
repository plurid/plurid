export function getPlurid() {
    let selectedPluridRoot = document.getElementById(pluridScene.meta.activePlurid);
    let selectedPluridSheet = document.getElementById(pluridScene.meta.activeSheet);

    return {
        root: selectedPluridRoot,
        sheet: selectedPluridSheet
    }
}
