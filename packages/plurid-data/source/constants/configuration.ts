import {
    PluridConfiguration,
} from '../';



export const defaultConfiguration: PluridConfiguration = {
    theme: {
        general: 'plurid',
        interaction: 'plurid',
    },
    micro: false,
    toolbar: true,
    planeControls: true,
    viewcube: true,
    planeDomainURL: true,
    planeOpacity: 1,
    planeWidth: 1,
    space: {
        layout: {
            type: 'COLUMNS',
            columns: 2,
        },
        perspective: 1000,
        transparent: false,
        center: true,
        showTransformOrigin: true,
        transformOriginSize: 'normal',
    },
    ui: {
        toolbar: {
            hide: false,
            alwaysShowIcons: false,
            alwaysShowTransformButtons: false,
        },
    },
}
