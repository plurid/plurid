// #region imports
    // #region libraries
    import {
        PluridRoute,
        PluridPlane,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import IsoMatcher from '../';
    import Parser from '../../Parser';
    import {
        extractQuery,
        extractFragments,
    } from '../../Parser/logic';
    import {
        cleanPathValue,
        computePlaneAddress,
    } from '../../logic';
    // #endregion external
// #endregion imports



// #region module
const routes: PluridRoute<string>[] = [
    {
        value: '/docs',
        exterior: 'docs',
    },
    {
        value: '/tag/:name',
        exterior: 'tag',
    },
];

const planes: PluridPlane<string>[] = [
    {
        route: '/p/:name',
        component: 'person',
    },
    {
        route: '/users/:id',
        component: 'user',
        parameters: {
            id: {
                length: 8,
                lengthType: '==',
            },
        },
    },
    {
        route: '/café',
        component: 'literal',
    },
];

const matcher = () => new IsoMatcher<string>({ routes, planes }, 'host');


/**
 * A QUERY STARTS AT ITS FIRST `?`, AND A HASH IS NOT A ROUTE (audit 2026-09-29 #13): a second `?`
 * (`?q=why?`, `?next=/b?c=1`) made the whole query `{}`, and the hash stayed on a route matched by
 * value (`/docs#api` matched nothing).
 */
describe('the query and the hash', () => {
    it('a query holding another ? is read whole', () => {
        expect(extractQuery('/a?next=/b?c=1')).toEqual({ next: '/b?c=1' });
        expect(extractQuery('/a?q=why?')).toEqual({ q: 'why?' });
        expect(extractQuery('/a?q=why?#frag')).toEqual({ q: 'why?' });
        expect(extractQuery('/a#frag?q=1')).toEqual({});
        expect(matcher().match('/p/a?q=why?')?.match.query).toEqual({ q: 'why?' });
    });

    it('a route is matched without its hash', () => {
        expect(cleanPathValue('/docs#a/b')).toBe('/docs');
        expect(cleanPathValue('/docs/#x')).toBe('/docs');
        expect(cleanPathValue('/docs?x#y')).toBe('/docs');
        expect(matcher().match('/docs#a/b', 'route')?.match.value).toBe('/docs');
        expect(matcher().match('/docs#x', 'route')?.match.value).toBe('/docs');
        expect(matcher().match('/tag/news#top', 'route')?.match.parameters).toEqual({ name: 'news' });
    });
});


/**
 * ONE PAGE HOWEVER IT IS ENCODED (audit 2026-09-29 #14): the address bar hands the space
 * `/p/Jos%C3%A9`, a link `/p/José` — two parameter values, two plane addresses (two plane ids), and
 * a validation of the encoded text (`john%20doe` is 10 characters).
 */
describe('percent-encoding', () => {
    it('a parameter is decoded before it is matched, validated and handed over', () => {
        const encoded = matcher().match('/p/caf%C3%A9')!;
        const plain = matcher().match('/p/café')!;
        expect(encoded.match.parameters).toEqual({ name: 'café' });
        expect(plain.match.parameters).toEqual({ name: 'café' });
        expect(encoded.match.value).toBe(plain.match.value);
        expect(matcher().match('/users/john%20doe')?.match.parameters).toEqual({ id: 'john doe' });
        expect(matcher().match('/users/john doe')).toBeTruthy();
        expect(matcher().match('/tag/caf%C3%A9', 'route')?.match.parameters).toEqual({ name: 'café' });
    });

    it('a literal route matches however either side encodes it', () => {
        expect(matcher().match('/caf%C3%A9')?.data.component).toBe('literal');
        expect(matcher().match('/café')?.data.component).toBe('literal');
        expect(computePlaneAddress('/caf%C3%A9', undefined, 'host')).toBe(computePlaneAddress('/café', undefined, 'host'));
    });

    it('the address is one form, stable however often it is taken; a malformed escape never throws', () => {
        const address = computePlaneAddress('/a%2Fb/100%25/%2541/caf%c3%a9', undefined, 'host');
        expect(address).toBe('plurid://host/a%2Fb/100%25/%2541/café');
        expect(computePlaneAddress(address)).toBe(address);
        expect(computePlaneAddress('/100%', undefined, 'host')).toBe('plurid://host/100%25');
        expect(() => matcher().match('/p/%E0%A4%A')).not.toThrow();
        expect(matcher().match('/p/%E0%A4%A')?.match.parameters).toEqual({ name: '%E0%A4%A' });
        // an escaped separator is part of ONE element: `a%2Fb` is not two
        expect(matcher().match('/p/a%2Fb')?.match.parameters).toEqual({ name: 'a/b' });
    });

    it('a fragment\'s text and element are decoded after they are split', () => {
        const fragments = extractFragments('/a#:~:text=hello%20world,end%2C%20really&element=main%20id,[1]');
        expect(fragments.texts[0]).toMatchObject({ start: 'hello world', end: 'end, really' });
        expect(fragments.elements[0]).toMatchObject({ id: 'main id', occurence: 1 });
        expect(extractFragments('/a#:~:text=a=b').texts[0].start).toBe('a=b');
    });

    it('the route a parser rebuilds re-encodes the query it decoded', () => {
        const parsed = new Parser('/p?q=a%26b&x=1%202', { value: '/p' } as PluridRoute<unknown>).extract();
        expect(parsed.query).toEqual({ q: 'a&b', x: '1 2' });
        expect(parsed.route).toBe('/p?q=a%26b&x=1+2');
        expect(new Parser(parsed.route, { value: '/p' } as PluridRoute<unknown>).extract().query).toEqual(parsed.query);
    });
});
// #endregion module
