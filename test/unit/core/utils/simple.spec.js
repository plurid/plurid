import { capitalize } from '../../../../src/js/source/core/utils/simple';

const assert = require('chai').assert;


describe('core > utils > simple', () => {
    describe('capitalize()', () => {
        it('should return first letter of string capitalized', () => {
            let testString = 'testString';

            assert.equal(capitalize(testString), "TestString");
        });
    });
});
