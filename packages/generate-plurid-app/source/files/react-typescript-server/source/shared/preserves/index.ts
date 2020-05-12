import {
    PluridPreserve,
} from '@plurid/plurid-react';



const preserves: PluridPreserve[] = [
    {
        value: '/',
        action: async (
            transmission,
        ) => {
            const {
                kind,
                context,
            } = transmission;

            const {
                path,
                contextualizers,
            } = context;

            switch (kind) {
                case 'client':
                    // custom logic for the client preserve of '/'
                    break;
                case 'server':
                    // custom logic for the server preserve of '/'
                    break;
            }

            return {
                providers: {},
            };
        },
    },
];


export default preserves;
