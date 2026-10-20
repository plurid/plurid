/**
 * @jest-environment jsdom
 */
/**
 * THE LENS READS THE REQUESTED ROUTE, AS THE PROP DOES (2026-10-20). `usePluridPlane()` gave the
 * registered route's query, fragments and parameters, while the `plurid` prop carried the ones the
 * view or the link asked for: `/doc/1?tab=x` read `{ tab: 'x' }` from the prop and `{}` from the hook.
 */
import React from 'react';

import {
    renderPlurid,
} from '../../../../testing';
import {
    usePluridPlane,
} from '../../../../services/hooks/plane';



const Document: React.FC<any> = (properties) => {
    const lens = usePluridPlane();
    return (
        <div>
            <span data-prop>{JSON.stringify([properties.plurid.plane.query, properties.plurid.plane.parameters])}</span>
            <span data-lens>{JSON.stringify([lens.query, lens.parameters])}</span>
        </div>
    );
};

describe('the requested route', () => {
    it('reaches usePluridPlane() as it reaches the plurid prop', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/doc/:id', component: Document }],
            view: ['/doc/1?tab=x'],
        } as any);
        const prop = rendered.container.querySelector('[data-prop]')!.textContent;
        const lens = rendered.container.querySelector('[data-lens]')!.textContent;
        expect(JSON.parse(prop!)[0]).toEqual({ tab: 'x' });
        expect(lens).toBe(prop);
        await rendered.unmount();
    });
});
