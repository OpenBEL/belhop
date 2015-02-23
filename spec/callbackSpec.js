/* global describe it expect belhop */
describe('belhop', function() {
  'use strict';

  describe('callbacks', function() {

    it('can be produced', function() {
      expect(belhop.factory.callback).toBeDefined();
      expect(typeof belhop.factory.callback).toBe('function');

      function success() {}
      function error() {}
      var cb = belhop.factory.callback(success, error);

      expect(cb).toBeDefined();
      expect(cb).not.toBeNull();

      expect(cb.success).toBe(success);
      expect(cb.error).toBe(error);
    });

    it('expose success/error functions', function() {
      function success() {}
      function error() {}
      var cb = belhop.factory.callback(success, error);

      expect(typeof cb.success).toBe('function');
      expect(typeof cb.error).toBe('function');
    });

    it('call user-provided functions', function() {
      var successCalled = false;
      function success() { successCalled = true; }
      var errorCalled = false;
      function error() { errorCalled = true; }
      var cb = belhop.factory.callback(success, error);

      cb.success();
      expect(successCalled).toBe(true);

      cb.error();
      expect(errorCalled).toBe(true);
    });

    it('can no-op errors', function() {
      function success() { }
      var cb = belhop.factory.callbackNoErrors(success);
      expect(cb.success).toBe(success);
      expect(typeof cb.error).toBe('function');
      expect(cb.error()).not.toBeDefined();
    });

    it('can no-op success', function() {
      function error() { }
      var cb = belhop.factory.callbackNoSuccess(error);
      expect(cb.error).toBe(error);
      expect(typeof cb.success).toBe('function');
      expect(cb.success()).not.toBeDefined();
    });

  });

});
