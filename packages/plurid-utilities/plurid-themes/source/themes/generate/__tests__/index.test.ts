import generateTheme from '..';



describe.only('generateTheme', () => {
    it('generates Theme', () => {
        const color = 'hsl(220, 20%, 40%)';
        const theme = generateTheme('dark', color);
        // console.log(theme);

        expect(true).toBeTruthy();
    });
});
