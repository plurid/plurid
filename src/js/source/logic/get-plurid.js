export function getPlurid() {
    let selectedPluridRoot = document.getElementById(pluridScene.metadata.activePlurid);
    let selectedPluridSheet = document.getElementById(pluridScene.metadata.activeSheet);

    return {
        root: selectedPluridRoot,
        sheet: selectedPluridSheet
    }
}
