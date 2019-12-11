import {
    PluridConfiguration,
} from '../';



export const defaultConfiguration: PluridConfiguration = {
    micro: false,
    theme: {
        general: 'plurid',
        interaction: 'plurid',
    },
    elements: {
        toolbar: {
            opaque: false,
            conceal: false,
            transformIcons: false,
            transformButtons: false,
        },
        viewcube: {
            show: true,
            opaque: true,
            conceal: false,
            buttons: true,
        },
        plane: {
            width: 1,
            opacity: 1,
            controls: {
                show: true,
                pathbar: {
                    domainURL: true,
                },
            },
        },
    },
    space: {
        layout: {
            type: 'COLUMNS',
            columns: 2,
        },
        perspective: 2000,
        opaque: true,
        center: false,
        transformOrigin: {
            show: true,
            size: 'normal',
        },
    },
};
