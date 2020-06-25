import {
    PluridStillerOptions,
} from '../interfaces';



export const defaultStillerOptions: PluridStillerOptions = {
    waitUntil: 'networkidle0',
    timeout: 30_000,
    ignore: [],
}
