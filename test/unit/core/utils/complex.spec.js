import { setId } from '../../../../src/js/source/core/utils/complex';



describe('core > utils > complex', () => {
    describe('setId()', () => {
        test('should return the current id number', () => {
            let element = {};
            element.id = '';
            let type = 'container';

            expect(setId(element, type)).toBe(1);
        });

        test('should set id for the given element based on the given type', () => {
            let element = {};
            element.id = '';
            let type = 'container';
            setId(element, type);

            expect(element.id).toBe('plurid-container-2');
        });
    });
});
