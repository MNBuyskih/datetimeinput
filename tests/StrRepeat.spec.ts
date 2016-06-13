describe('StrRepeat', () => {
    it('should repeat string 3 times', () => {
        let s = Datetime.StrRepeat('a', 3);
        expect(s.length).toBe(3);
        expect(/^aaa$/.test(s)).toBe(true);
    });
});