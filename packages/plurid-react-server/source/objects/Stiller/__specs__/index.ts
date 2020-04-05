import Stiller from '../';


describe('Stiller', () => {
    it.only('works', async () => {
        const routes = [
            '/one',
            '/two',
        ];
        const stiller = new Stiller({
            routes,
            Application: '',
        });

        const sequence = stiller.still();

        const values = [];

        let next;
        while (
            !(next = await sequence.next()).done
        ) {
            values.push(next.value);
        }


        expect(values).toStrictEqual(routes);
    });
});
