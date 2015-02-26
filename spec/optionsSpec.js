/* global describe it expect belhop beforeEach */
describe('belhop', function() {
  'use strict';

  describe('options', function() {

    it('is a factory', function() {
      var factory = belhop.factory.options;
      expect(factory).toBeDefined();
      expect(typeof factory).toEqual('object');
    });

  });

  describe('filter options', function() {
    var factory;
    var filter;

    beforeEach(function() {
      factory = belhop.factory.options.filter;
      expect(factory).toBeDefined();
    });

    it('is a factory', function() {
      expect(typeof factory).toEqual('object');
    });

    it('can create custom filters', function() {
      expect(factory.custom).toBeDefined();
      filter = factory.custom('CAT', 'NAME', 'VALUE');
      expect(filter instanceof belhop.__.FilterOptions).toEqual(true);
    });

    it('can create default filters', function() {
      expect(factory.default).toBeDefined();
      filter = factory.default('VALUE');
      expect(filter instanceof belhop.__.DefaultFilterOptions).toEqual(true);
    });

  });

  describe('search options', function() {
    var factory;
    var filter;
    var search;

    beforeEach(function() {
      factory = belhop.factory.options.search;
      expect(factory).toBeDefined();
    });

    it('is a factory', function() {
      expect(typeof factory).toEqual('object');
    });

    it('can create custom search options', function() {
      expect(factory.custom).toBeDefined();
      filter = belhop.factory.options.filter.default('VALUE');
      search = factory.custom(filter, 0, 5);
      expect(search instanceof belhop.__.SearchOptions).toEqual(true);
    });

    it('can create default search options', function() {
      expect(factory.default).toBeDefined();
      search = factory.default('VALUE');
      expect(search instanceof belhop.__.DefaultSearchOptions).toEqual(true);
    });

    it('can create evidence search options', function() {
      expect(factory.evidence).toBeDefined();
      filter = belhop.factory.options.filter.default('VALUE');
      search = factory.evidence(filter, 10, 10);
      expect(search instanceof belhop.__.SearchOptions).toEqual(true);
    });

  });

});
