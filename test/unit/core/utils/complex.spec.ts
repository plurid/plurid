import { setId } from '../../../../src/ts/source/core/utils/complex';



describe('core > utils > complex', () => {
    describe('setId()', () => {
        test('should return the current id number', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'container';

            expect(setId(element, type)).toBe(1);
        });

        test('should set id for the given element based on the given type (container)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'container';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-container-2');
        });

        test('should set id for the given element based on the given type (roots)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'roots';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-roots-1');
        });

        test('should set id for the given element based on the given type (root)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'root';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-root-1');
        });

        test('should set id for the given element based on the given type (options)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'options';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-options-1');
        });

        test('should set id for the given element based on the given type (sheet)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'sheet';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-sheet-1');
        });

        test('should set id for the given element based on the given type (link)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'link';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-link-1');
        });

        test('should set id for the given element based on the given type (anchor)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'anchor';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-anchor-1');
        });

        test('should set id for the given element based on the given type (branch)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'branch';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-branch-1');
        });

        test('should set id for the given element based on the given type (shadow)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'shadow';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-shadow-1');
        });

        test('should set id for the given element based on the given type (viewcube)', () => {
            const element = {};
            (<any> element).id = '';
            const type = 'viewcube';
            setId(element, type);

            expect((<any> element).id).toBe('plurid-viewcube-1');
        });
    });
});
