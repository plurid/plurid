import { capitalize } from '../../../../src/js/source/core/utils/simple';



describe('core > utils > simple', () => {
    describe('capitalize()', () => {
        test('should return first letter of string capitalized', () => {
            let testString = 'testString';

            expect(capitalize(testString)).toBe('TestString');
        });
    });
});
