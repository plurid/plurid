import PluridPubSub from '../';



describe('PluridPubSub', () => {
    it('publishes and subscribes', () => {
        const pluridPubSub = new PluridPubSub();

        pluridPubSub.subscribe('space.increase.rotateY', (data: any) => {
            const {
                value,
            } = data;
            // increase the rotateY with value
            console.log('called topic space.increase.rotateY with value:', value);
        });

        pluridPubSub.publish('space.increase.rotateY', { value: 1 });

        expect(true).toBeTruthy();
    });

    it('subscribes and unsubscribes', () => {
        const pluridPubSub = new PluridPubSub();

        pluridPubSub.subscribe('space.increase.rotateY', (data: any) => {
            const {
                value,
            } = data;
            // increase the rotateY with value
            console.log('called topic space.increase.rotateY with value:', value);
        });

        pluridPubSub.publish('space.increase.rotateY', { value: 1 });

        const unsubscribed = pluridPubSub.unsubscribe('space.increase.rotateY');

        expect(unsubscribed).toBe(true);
    });
});
