describe("belhop", function () {

  describe("validate", function () {

    it("can validate syntax", function () {
      expect(BH.validate.syntax()).toEqual({});
    });

    it("can validate semantics", function () {
      expect(BH.validate.semantics()).toEqual({});
    });
  });

});
