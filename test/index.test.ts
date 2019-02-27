import PluridEngine from '../src/'

/**
 * PluridEngine working test
 */
describe('Dummy test', () => {
    it('works if true is truthy', () => {
        expect(true).toBeTruthy()
    })

    it('DummyClass is instantiable', () => {
        expect(new PluridEngine()).toBeInstanceOf(PluridEngine)
    })
})
