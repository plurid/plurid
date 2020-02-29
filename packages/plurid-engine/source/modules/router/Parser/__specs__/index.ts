import Parser from '../';

import {
    Route,
} from '../../interfaces';


describe('Parser', () => {
    it('simple string', () => {
        const route: Route<any> = {
            location: '/one',
            view: 'one',
        };
        const parser = new Parser('/one', route);
        const response = parser.extract();
        // console.log(response);
        expect(response.query).toStrictEqual({});
    });

    it.only('with parameter', () => {
        const route: Route<any> = {
            location: '/two/:id',
            view: 'two',
        };
        const parser = new Parser('/two/123', route);
        const response = parser.extract();
        console.log(response);
        expect(response.query).toStrictEqual({});
    });

    it('with query', () => {
        const route: Route<any> = {
            location: '/three',
            view: 'three',
        };
        const parser = new Parser('/three?q=three', route);
        const response = parser.extract();
        const query = {
            q: 'three',
        };
        expect(response.query).toStrictEqual(query);
    });

    it('with text fragment', () => {
        const route: Route<any> = {
            location: '/four',
            view: 'four',
        };
        const parser = new Parser('/four#:~:text=fourStart,fourEnd,[1]', route);
        const response = parser.extract();
        const fragmentsTexts = [
            { type: 'text', start: 'fourStart', end: 'fourEnd', occurence: 1 },
        ];
        expect(response.fragments.texts).toStrictEqual(fragmentsTexts);
    });

    it('with element fragment', () => {
        const route: Route<any> = {
            location: '/five',
            view: 'five',
        };
        const parser = new Parser('/five#:~:element=555,[2]', route);
        const response = parser.extract();
        const fragmentsElements = [
            { type: 'element', id: '555', occurence: 2 },
        ];
        expect(response.fragments.elements).toStrictEqual(fragmentsElements);
    });
});
