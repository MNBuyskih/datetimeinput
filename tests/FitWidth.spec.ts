describe('FitWidth', () => {
    it('should return correct width for symbols', () => {
        let el = $('<input style="font-family: monospace; font-size: 10px; padding: 0px">');

        expect(Datetime.spanWidth(el, 2) / Datetime.spanWidth(el, 1)).toBe(2);
    });
});