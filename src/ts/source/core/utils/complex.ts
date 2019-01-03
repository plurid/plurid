/**
 * Closure to set id variables to 0
 * and return counting function setting id to HTMLElement
 * and return id number
 *
 * @return {function}
 */
export let setId = ( () => {
    const id: any = {};
    id.containerNumber = 0;
    id.rootsNumber = 0;
    id.rootNumber = 0;
    id.optionsNumber = 0;
    id.sheetNumber = 0;
    id.linkNumber = 0;
    id.anchorNumber = 0;
    id.branchNumber = 0;
    id.shadowNumber = 0;
    id.viewcubeNumber = 0;

    /**
     * Counter, sets id to element, returns id number.
     *
     * @param {HTMLElement} element
     * @param {string} type                 String type of the element, e.g. 'link'
     * @return {number}
     */
    return (element, type) => {
        const set = (element, type, idNumber) => {
            idNumber += 1;
            element.id = `plurid-${type}-${idNumber}`;
            return idNumber;
        };

        switch (type) {
            case 'container':
                return id.containerNumber = set(element, type, id.containerNumber);
            case 'roots':
                return id.rootsNumber = set(element, type, id.rootsNumber);
            case 'root':
                return id.rootNumber = set(element, type, id.rootNumber);
            case 'options':
                return id.optionsNumber = set(element, type, id.optionsNumber);
            case 'sheet':
                return id.sheetNumber = set(element, type, id.sheetNumber);
            case 'link':
                return id.linkNumber = set(element, type, id.linkNumber);
            case 'anchor':
                return id.anchorNumber = set(element, type, id.anchorNumber);
            case 'branch':
                return id.branchNumber = set(element, type, id.branchNumber);
            case 'shadow':
                return id.shadowNumber = set(element, type, id.shadowNumber);
            case 'viewcube':
                return id.viewcubeNumber = set(element, type, id.viewcubeNumber);
        }
    };
})();
