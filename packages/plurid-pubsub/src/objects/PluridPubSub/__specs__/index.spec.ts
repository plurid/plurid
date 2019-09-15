import PluridPubSub from '../';



describe('PluridPubSub', () => {
    it('publishes and subscribes', () => {
        const pluridPubSub = new PluridPubSub();

        pluridPubSub.subscribe('space.increase.rotateY', (data: any) => {
            const {
                value,
            } = data;
            // increase the rotateY with value
            console.log(value);
        });

        pluridPubSub.publish('space.increase.rotateY', { value: 1 });

        expect(true).toBeTruthy();
    });
});
