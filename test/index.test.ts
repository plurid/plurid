import { PluridEngine } from '../src/'

/**
 * PluridEngine working test
 */
describe('PluridEngine test', () => {
    it('works if true is truthy', () => {
        expect(true).toBeTruthy()
    })

    it('PluridEngine is instantiable', () => {
        expect(new PluridEngine()).toBeInstanceOf(PluridEngine)
    })
})
