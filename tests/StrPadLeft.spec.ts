describe('StrPadLeft', () => {
    it('should add 1 char in string start', () => {
        expect(/^0a$/.test(Datetime.StrPadLeft('a', 2))).toBe(true);
    });
});