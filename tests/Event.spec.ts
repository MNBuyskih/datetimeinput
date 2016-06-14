describe('Event', () => {
    let e = new Datetime.Event();
    it('should add event', (done) => {
        e.on('test', done);
        e.trigger('test');
    });
    it('should add event and pass params', (done) => {
        e.on('test', (d) => {
            expect(d).toBe(123);
            done();
        });
        e.trigger('test', 123);
    });
});