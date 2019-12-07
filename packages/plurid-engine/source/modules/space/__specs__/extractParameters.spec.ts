import {
    extractParameters,
} from '../';



describe('extractParameters', () => {
    it('extracts a simple parameter', () => {
        const pagePath = '/page-2/loo/soo';
        const parameters = [
            {
                index: 1,
                name: 'foo',
            },
            {
                index: 2,
                name: 'boo',
            },
        ];
        const result = extractParameters(pagePath, parameters);

        const expected = {
            foo: 'loo',
            boo: 'soo'
        };
        expect(result).toMatchObject(expected);
    });
});
