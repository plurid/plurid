import { capitalize } from '../../../../src/ts/source/core/utils/simple';



describe('core > utils > simple', () => {
    describe('capitalize()', () => {
        test('should return first letter of string capitalized', () => {
            const testString = 'testString';

            expect(capitalize(testString)).toBe('TestString');
        });
    });
});
