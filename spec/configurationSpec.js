/* global describe it expect belhop */
describe('belhop', function() {
  'use strict';

  describe('configuration', function() {

    it('has a default API URL', function() {
      expect(belhop.DEFAULT_API_URL).toBeDefined();
    });

    it('can get the API URL', function() {
      expect(belhop.configuration.getAPIURL()).toBeDefined();
    });

    it('defaults to using the default API URL', function() {
      expect(belhop.configuration.getAPIURL()).toEqual(belhop.DEFAULT_API_URL);
    });

    it('can change the API URL', function() {
      var newURL = 'http://api.openbel.org/bel';
      belhop.configuration.setAPIURL(newURL);
      expect(belhop.configuration.getAPIURL()).toEqual(newURL);
    });

    it('can reset to the default API URL', function() {
      belhop.configuration.setAPIURL(null);
      expect(belhop.configuration.getAPIURL()).toEqual(belhop.DEFAULT_API_URL);
    });

    it('has a default schema URL', function() {
      expect(belhop.DEFAULT_SCHEMA_URL).toBeDefined();
    });

    it('can get the schema URL', function() {
      expect(belhop.configuration.getSchemaURL()).toBeDefined();
    });

    it('defaults to using the default schema URL', function() {
      var expected = belhop.DEFAULT_SCHEMA_URL;
      expect(belhop.configuration.getSchemaURL()).toEqual(expected);
    });

    it('can change the schema URL', function() {
      var newURL = 'http://api.openbel.org/schema';
      belhop.configuration.setSchemaURL(newURL);
      expect(belhop.configuration.getSchemaURL()).toEqual(newURL);
    });

    it('can reset to the default schema URL', function() {
      var expected = belhop.DEFAULT_SCHEMA_URL;
      belhop.configuration.setSchemaURL(null);
      expect(belhop.configuration.getSchemaURL()).toEqual(expected);
    });

    it('can be tested', function(done) {
      var cb = belhop.factory.callbackNoErrors(done);
      belhop.configuration.test(cb);
    });

  });

});
