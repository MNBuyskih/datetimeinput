describe('FitWidth', () => {
    it('should return correct width for symbols', () => {
        let el = $('<input style="font-family: monospace; font-size: 10px; padding: 0px">');
        expect(Datetime.spanWidth(el, 2) / Datetime.spanWidth(el, 1)).toBe(2);
    });
    it('should set input width', () => {
        let el = $('<input style="font-family: monospace; font-size: 10px; padding: 0px">');
        new Datetime.FitWidth(el, 2);
        expect(el.width()).toBe(Datetime.spanWidth(el, 2));
    });
});