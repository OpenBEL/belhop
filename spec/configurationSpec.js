describe("belhop", function () {

  describe("configuration", function() {

    it("has a default API URL", function() {
      expect(BH.defaultURL).toBeDefined();
    });

    it("can get the API URL", function() {
      expect(BH.configuration.getURL()).toBeDefined();
    });

    it("defaults to using the default API URL", function() {
      expect(BH.configuration.getURL()).toEqual(BH.defaultURL);
    });

    it("can change API URL", function() {
      var newURL = "http://api.openbel.org/bel";
      BH.configuration.setURL(newURL);
      expect(BH.configuration.getURL()).toEqual(newURL);
    });

  });

});
