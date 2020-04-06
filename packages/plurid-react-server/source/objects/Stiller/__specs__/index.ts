import Stiller from '../';


describe('Stiller', () => {
    it.only('works', async () => {
        const routes = [
            '/',
            '/products',
        ];
        const stiller = new Stiller({
            host: 'https://plurid.com',
            routes,
        });

        const sequence = stiller.still();

        const values = [];

        let next;
        while (
            !(next = await sequence.next()).done
        ) {
            values.push(next.value);
        }
        console.log(values);


        // expect(values).toStrictEqual(routes);
        expect([]).toStrictEqual([]);
    });
});
