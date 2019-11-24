import {
    PluridConfiguration,
} from '../';



const defaultConfiguration: PluridConfiguration = {
    theme: 'plurid',
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
    },
}


export default defaultConfiguration;
