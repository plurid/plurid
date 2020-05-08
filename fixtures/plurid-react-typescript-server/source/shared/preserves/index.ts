import {
    PluridPreserve,
} from '@plurid/plurid-data';



const preserves: PluridPreserve[] = [
    {
        value: '/',
        action: async (
            transmission,
        ) => {
            const {
                request,
                response,
                context,
            } = transmission;

            // custom logic for the preserve of '/'

            return {
                providers: {},
            };
        },
    },
];


export default preserves;
