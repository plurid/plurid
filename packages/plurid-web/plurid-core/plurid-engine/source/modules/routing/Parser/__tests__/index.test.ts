// #region imports
    // #region libraries
    import {
        PluridRoute,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import Parser from '../';
    // #endregion external
// #endregion imports



// #region module
xdescribe('Parser', () => {
    it('works', () => {});

    // it('simple string', () => {
    //     const route: PluridRoute = {
    //         value: '/one',
    //         // path: '/one',
    //         // view: 'one',
    //     };
    //     const parser = new Parser('/one', route);
    //     const response = parser.extract();
    //     expect(response.query).toStrictEqual({});
    // });

    // it('with parameter', () => {
    //     const route: PluridRoute = {
    //         value: '/two/:id',
    //         // path: '/two/:id',
    //         // view: 'two',
    //     };
    //     const parser = new Parser('/two/123', route);
    //     const response = parser.extract();
    //     const parameters = { id: '123' };
    //     expect(response.parameters).toStrictEqual(parameters);
    // });

    // it('with no parameter', () => {
    //     const route: PluridRoute = {
    //         value: '/two/:id',
    //         // path: '/two/:id',
    //         // view: 'two',
    //     };
    //     const parser = new Parser('/twoB/123', route);
    //     const response = parser.extract();
    //     expect(response.parameters).toStrictEqual({});
    // });

    // it('with query', () => {
    //     const route: PluridRoute = {
    //         value: '/three',
    //         // path: '/three',
    //         // view: 'three',
    //     };
    //     const parser = new Parser('/three?q=three', route);
    //     const response = parser.extract();
    //     const query = {
    //         q: 'three',
    //     };
    //     expect(response.query).toStrictEqual(query);
    // });

    // it('with text fragment', () => {
    //     const route: PluridRoute = {
    //         value: '/four',
    //         // path: '/four',
    //         // view: 'four',
    //     };
    //     const parser = new Parser('/four#:~:text=fourStart,fourEnd,[1]', route);
    //     const response = parser.extract();
    //     const fragmentsTexts: any[] = [
    //         { type: 'text', start: 'fourStart', end: 'fourEnd', occurence: 1 },
    //     ];
    //     expect(response.fragments.texts).toStrictEqual(fragmentsTexts);
    // });

    // it('with invalid text fragment', () => {
    //     const route: PluridRoute = {
    //         value: '/four',
    //         // path: '/four',
    //         // view: 'four',
    //     };
    //     const parser = new Parser('/four#:~:text=', route);
    //     const response = parser.extract();
    //     const fragmentsTexts: any[] = [];
    //     expect(response.fragments.texts).toStrictEqual(fragmentsTexts);
    // });

    // it('with incomplete text fragment', () => {
    //     const route: PluridRoute = {
    //         value: '/four',
    //         // path: '/four',
    //         // view: 'four',
    //     };
    //     const parser = new Parser('/four#:~:text=start', route);
    //     const response = parser.extract();
    //     const fragmentsTexts: any[] = [
    //         { type: 'text', start: 'start', end: '', occurence: 0 },
    //     ];
    //     expect(response.fragments.texts).toStrictEqual(fragmentsTexts);
    // });

    // it('with element fragment', () => {
    //     const route: PluridRoute = {
    //         value: '/five',
    //         // path: '/five',
    //         // view: 'five',
    //     };
    //     const parser = new Parser('/five#:~:element=555,[2]', route);
    //     const response = parser.extract();
    //     const fragmentsElements: any[] = [
    //         { type: 'element', id: '555', occurence: 2 },
    //     ];
    //     expect(response.fragments.elements).toStrictEqual(fragmentsElements);
    // });

    // it('with invalid element fragment', () => {
    //     const route: PluridRoute = {
    //         value: '/five',
    //         // path: '/five',
    //         // view: 'five',
    //     };
    //     const parser = new Parser('/five#:~:element=,[2]', route);
    //     const response = parser.extract();
    //     const fragmentsElements: any[] = [];
    //     expect(response.fragments.elements).toStrictEqual(fragmentsElements);
    // });


    // it('with parameter and query', () => {
    //     const route: PluridRoute = {
    //         value: '/three/:par',
    //         // path: '/three/:par',
    //         // view: 'three',
    //     };
    //     const parser = new Parser('/three/fff?q=threePQ', route);
    //     const response = parser.extract();

    //     const parameters = { par: 'fff' };
    //     expect(response.parameters).toStrictEqual(parameters);

    //     const query = {
    //         q: 'threePQ',
    //     };
    //     expect(response.query).toStrictEqual(query);
    // });

    // it('with parameter and query and text fragment', () => {
    //     const route: PluridRoute = {
    //         value: '/three/:par',
    //         // path: '/three/:par',
    //         // view: 'three',
    //     };
    //     const parser = new Parser('/three/fff?q=threePQT#:~:text=threeStart,threeEnd,[45]', route);
    //     const response = parser.extract();

    //     const parameters = { par: 'fff' };
    //     expect(response.parameters).toStrictEqual(parameters);

    //     const query = {
    //         q: 'threePQT',
    //     };
    //     expect(response.query).toStrictEqual(query);

    //     const fragmentsTexts: any[] = [
    //         { type: 'text', start: 'threeStart', end: 'threeEnd', occurence: 45 },
    //     ];
    //     expect(response.fragments.texts).toStrictEqual(fragmentsTexts);
    // });

    // it('with parameter and query and text fragment and element fragment', () => {
    //     const route: PluridRoute = {
    //         value: '/three/:par',
    //         // path: '/three/:par',
    //         // view: 'three',
    //     };
    //     const parser = new Parser('/three/fff?q=threePQT#:~:text=threeStart,threeEnd,[45]&element=foo,[533]', route);
    //     const response = parser.extract();

    //     const parameters = { par: 'fff' };
    //     expect(response.parameters).toStrictEqual(parameters);

    //     const query = {
    //         q: 'threePQT',
    //     };
    //     expect(response.query).toStrictEqual(query);

    //     const fragmentsTexts: any[] = [
    //         { type: 'text', start: 'threeStart', end: 'threeEnd', occurence: 45 },
    //     ];
    //     expect(response.fragments.texts).toStrictEqual(fragmentsTexts);

    //     const fragmentsElements: any[] = [
    //         { type: 'element', id: 'foo', occurence: 533 },
    //     ];
    //     expect(response.fragments.elements).toStrictEqual(fragmentsElements);
    // });

    // it('gateway', () => {
    //     const path: PluridRoute = {
    //         value: '/gateway',
    //     };
    //     const parser = new Parser(
    //         '/gateway?plurid=https%3A%2F%2Fdomain.com%3A%2F%2Fr%3Fq%3D3%23%3A~%3At%3D2%3A%2F%2Fs%3A%2F%2Fu%3A%2F%2Fc%3A%2F%2F%2Fa-plane',
    //         path,
    //     );
    //     const response = parser.extract();
    //     const {
    //         query,
    //     } = response;

    //     expect(query.plurid).toEqual('https://domain.com://r?q=3#:~:t=2://s://u://c:///a-plane');
    // });
});
// #endregion module
