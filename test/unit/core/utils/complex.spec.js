import { setId } from '../../../../src/js/source/core/utils/complex';



describe('core > utils > complex', () => {
    describe('setId()', () => {
        test('should return the current id number', () => {
            let element = {};
            element.id = '';
            let type = 'container';

            expect(setId(element, type)).toBe(1);
        });

        test('should set id for the given element based on the given type (container)', () => {
            let element = {};
            element.id = '';
            let type = 'container';
            setId(element, type);

            expect(element.id).toBe('plurid-container-2');
        });

        test('should set id for the given element based on the given type (roots)', () => {
            let element = {};
            element.id = '';
            let type = 'roots';
            setId(element, type);

            expect(element.id).toBe('plurid-roots-1');
        });

        test('should set id for the given element based on the given type (root)', () => {
            let element = {};
            element.id = '';
            let type = 'root';
            setId(element, type);

            expect(element.id).toBe('plurid-root-1');
        });

        test('should set id for the given element based on the given type (options)', () => {
            let element = {};
            element.id = '';
            let type = 'options';
            setId(element, type);

            expect(element.id).toBe('plurid-options-1');
        });

        test('should set id for the given element based on the given type (sheet)', () => {
            let element = {};
            element.id = '';
            let type = 'sheet';
            setId(element, type);

            expect(element.id).toBe('plurid-sheet-1');
        });

        test('should set id for the given element based on the given type (link)', () => {
            let element = {};
            element.id = '';
            let type = 'link';
            setId(element, type);

            expect(element.id).toBe('plurid-link-1');
        });

        test('should set id for the given element based on the given type (anchor)', () => {
            let element = {};
            element.id = '';
            let type = 'anchor';
            setId(element, type);

            expect(element.id).toBe('plurid-anchor-1');
        });

        test('should set id for the given element based on the given type (branch)', () => {
            let element = {};
            element.id = '';
            let type = 'branch';
            setId(element, type);

            expect(element.id).toBe('plurid-branch-1');
        });

        test('should set id for the given element based on the given type (shadow)', () => {
            let element = {};
            element.id = '';
            let type = 'shadow';
            setId(element, type);

            expect(element.id).toBe('plurid-shadow-1');
        });

        test('should set id for the given element based on the given type (viewcube)', () => {
            let element = {};
            element.id = '';
            let type = 'viewcube';
            setId(element, type);

            expect(element.id).toBe('plurid-viewcube-1');
        });
    });
});
