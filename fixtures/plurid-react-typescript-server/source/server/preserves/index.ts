import {
    PluridPreserve,
} from '@plurid/plurid-react';



const preserves: PluridPreserve<any>[] = [
    {
        value: '/',
        onServe: async (
            transmission,
        ) => {
            const {
                context,
                // response,
                // request,
            } = transmission;

            const {
                path,
                contextualizers,
            } = context;

            // custom logic for the server preserve of '/'

            return {
                providers: {},
            };
        },
    },
];


export default preserves;
