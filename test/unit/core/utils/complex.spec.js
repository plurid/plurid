import { setId } from '../../../../src/js/source/core/utils/complex';

const assert = require('chai').assert;


describe('core > utils > complex', () => {
    describe('setId()', () => {
        it('should return the current id number', () => {
            let element = {};
            element.id = '';
            let type = 'container';

            assert.equal(setId(element, type), 1);
        });
        it('should set id for the given element based on the given type', () => {
            let element = {};
            element.id = '';
            let type = 'container';
            setId(element, type);

            assert.equal(element.id, 'plurid-container-2');
        });
    });
});
