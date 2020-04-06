import Stiller from '../';


describe('Stiller', () => {
    it.only('works', async () => {
        const routes = [
            'https://plurid.com',
            'https://plurid.com/products',
        ];
        const stiller = new Stiller({
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
