describe("belhop", function () {

  describe("validate", function () {

    it("can validate syntax", function () {
      expect(belhop.validate.syntax()).toEqual({});
    });

    it("can validate semantics", function () {
      expect(belhop.validate.semantics()).toEqual({});
    });
  });

});
