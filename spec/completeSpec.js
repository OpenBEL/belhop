describe("belhop", function () {

    describe("complete", function () {
        it("can handle statements", function () {
            expect(BH.complete.statement()).toEqual({});
        });
        it("can handle terms", function () {
            expect(BH.complete.term()).toEqual({});
        });
    });

});
