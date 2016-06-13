describe('Last Day Of Month', () => {
    it('should return 31 for January in this year', () => {
        expect(Datetime.LastDayOfMonth(0)).toBe(31);
    });
    it('should return 28 for for February 2015', () => {
        expect(Datetime.LastDayOfMonth(1, 2015)).toBe(28);
    });
    it('should return 29 for for February 2016', () => {
        expect(Datetime.LastDayOfMonth(1, 2016)).toBe(29);
    });
});