/* global describe it expect belhop */
describe('belhop', function() {
  'use strict';

  describe('validate', function() {

    it('can validate syntax', function() {
      expect(belhop.validate.syntax).toBeDefined();
      expect(belhop.validate.syntax()).toEqual({});
    });

    it('can validate semantics', function() {
      expect(belhop.validate.semantics).toBeDefined();
      expect(belhop.validate.semantics()).toEqual({});
    });
  });

});
