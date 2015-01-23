describe("belhop", function () {

  describe("configuration", function() {

    it("has a default API URL", function() {
      expect(belhop.DEFAULT_URL).toBeDefined();
    });

    it("can get the API URL", function() {
      expect(belhop.configuration.getURL()).toBeDefined();
    });

    it("defaults to using the default API URL", function() {
      expect(belhop.configuration.getURL()).toEqual(belhop.DEFAULT_URL);
    });

    it("can change API URL", function() {
      var newURL = "http://api.openbel.org/bel";
      belhop.configuration.setURL(newURL);
      expect(belhop.configuration.getURL()).toEqual(newURL);
    });

  });

});
