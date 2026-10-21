import { defaultConfiguration } from '@plurid/plurid-data';
import { makeSpaceStore } from '../../../../testing/store';
import { treePlane } from '../../../../testing/fixtures';
import { toggleLinkPlane } from '../planes';
const registry: any = new Map([['/detail', { route: { absolute: '/detail', value: '/detail', fragments: { elements: [], texts: [] }, parameters: {}, query: {} }, component: () => null }]]);
it('probe', () => {
    const store = makeSpaceStore(defaultConfiguration, [treePlane('a', { location: { translateX: 100 } })]);
    const link = (index: number, extra: any = {}) => ({ parentPlaneID: 'a', linkID: 'a#/detail#' + index, route: '/detail', linkCoordinates: { x: 300, y: 40 }, planesRegistry: registry, navigate: false, ...extra });
    const rows = () => store.tree()[0].children!.map((n) => [n.planeID.slice(-6), n.show, n.bridgeLength, n.width]);
    store.dispatch(toggleLinkPlane(link(0)) as any); console.log('spawn B', JSON.stringify(rows()));
    store.dispatch(toggleLinkPlane(link(0)) as any); console.log('close B', JSON.stringify(rows()));
    store.dispatch(toggleLinkPlane(link(1)) as any); console.log('spawn C', JSON.stringify(rows()));
    store.dispatch(toggleLinkPlane(link(0, { mode: 'open', bridgeLength: 100 })) as any); console.log('reopen B', JSON.stringify(rows()));
});
