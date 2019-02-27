import { getDirection } from './modules/getDirection'

export default class PluridEngine {
    public getDirection(
        event: any,
        absthreshold: number = 10,
        threshold: number = 0
    ) {
        getDirection(event, absthreshold, threshold)
    }
}
