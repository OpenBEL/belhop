describe("belhop", function () {

    describe("complete", function () {
        it("can handle statements", function () {
            expect(belhop.complete.statement()).toEqual({});
        });
        it("can handle terms", function () {
            expect(belhop.complete.term()).toEqual({});
        });
    });

});
