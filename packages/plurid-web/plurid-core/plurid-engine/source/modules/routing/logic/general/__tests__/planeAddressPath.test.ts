import {
    planeAddressPath,
    planeIDPath,
    computePlaneAddress,
} from '..';



describe('planeAddressPath', () => {
    it('is the inverse of computePlaneAddress for the address bar', () => {
        expect(planeAddressPath('plurid://localhost:5275/page-1/about')).toBe('/page-1/about');
        expect(planeAddressPath('plurid://localhost/a/')).toBe('/a');
        expect(planeAddressPath('plurid://localhost')).toBe('/');
        expect(planeAddressPath('plurid://localhost/')).toBe('/');
        expect(planeAddressPath('plurid://localhost/a?x=1#details')).toBe('/a');
        expect(planeAddressPath('plurid://localhost/users/@alice')).toBe('/users/@alice');
        expect(planeAddressPath('/page-1/contact')).toBe('/page-1/contact');
        expect(planeAddressPath('https://example.com/page')).toBeNull();
        expect(planeAddressPath('http://example.com/page')).toBeNull();
        expect(planeAddressPath(computePlaneAddress('/page-1/about', undefined, 'localhost:5275'))).toBe('/page-1/about');
    });
});


describe('a route keeps its @; a plane id loses its suffix', () => {
    it('planeAddressPath leaves a route\'s last segment whole', () => {
        expect(planeAddressPath('plurid://host.com/package/react@18')).toBe('/package/react@18');
        expect(planeAddressPath('/u/me@x')).toBe('/u/me@x');
        expect(planeAddressPath('plurid://host.com/a/b@c-d')).toBe('/a/b@c-d');
    });

    it('planeIDPath cuts the id suffix, and only it', () => {
        expect(planeIDPath('plurid://localhost:5275/page-1/about@0')).toBe('/page-1/about');
        expect(planeIDPath('plurid://localhost:5275/page-1/about@a3bab557')).toBe('/page-1/about');
        expect(planeIDPath('plurid://host.com/package/react@18@0')).toBe('/package/react@18');
        expect(planeIDPath('plurid://host.com/search?q=a@1')).toBe('/search');
        expect(planeIDPath('/plain')).toBe('/plain');
    });
});
