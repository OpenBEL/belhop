/* global describe it expect fail belhop */
describe('belhop', function() {
  'use strict';

  var types = [];

  describe('annotation', function() {

    describe('types', function() {

      it('can be retrieved', function(done) {
        expect(belhop.annotations.getTypes).toBeDefined();
        var onSucc = function(annotations, status, xhr) {
          expect(xhr.status).toEqual(200);
          expect(annotations.length).toBeGreaterThan(0);
          annotations.forEach(function(x) {
            types.push(x);
          });
          done();
        };
        var onErr = function(xhr) {
          expect(xhr.status).toEqual(200);
          done();
        };
        var cb = belhop.factory.callback(onSucc, onErr);
        belhop.annotations.getTypes(cb);
      });

      it('can be retrieved individually', function(done) {
        var retrieved = 0;
        expect(types.length).toBeGreaterThan(0);
        var onSucc = function(annotations, status, xhr) {
          expect(xhr.status).toEqual(200);
          retrieved++;
          if (retrieved === types.length) {
            done();
          }
        };
        var onErr = function(xhr) {
          expect(xhr.status).toEqual(200);
          done();
        };
        var cb = belhop.factory.callback(onSucc, onErr);
        types.forEach(function(x) {
          belhop.annotations.getType(x.prefix, cb);
        });
      });

      it('can be retrieved even when not found', function(done) {
        var onSucc = function(annotations, status, xhr) {
          expect(xhr.status).toEqual(404);
          expect(annotations).toBeNull();
          done();
        };
        var onErr = function() {
          fail();
        };
        var cb = belhop.factory.callback(onSucc, onErr);
        belhop.annotations.getType('BAD_ANNOTYPE_PREFIX', cb);
      });

    });

    describe('values', function() {

      it('can be retrieved', function(done) {
        expect(belhop.annotations.getTypes).toBeDefined();
        var onSucc = function(annotations, status, xhr) {
          expect(xhr.status).toEqual(200);
          expect(annotations.length).toBeGreaterThan(0);
          annotations.forEach(function(x) {
            types.push(x);
          });
          done();
        };
        var onErr = function(xhr) {
          expect(xhr.status).toEqual(200);
          done();
        };
        var cb = belhop.factory.callback(onSucc, onErr);
        belhop.annotations.getTypes(cb);
      });

      it('can be retrieved even when not found', function(done) {
        var onSucc = function(annotations, status, xhr) {
          expect(xhr.status).toEqual(404);
          expect(annotations).toBeNull();
          done();
        };
        var onErr = function() {
          fail();
        };
        var cb = belhop.factory.callback(onSucc, onErr);
        belhop.annotations.getValue('BAD_ANNOTYPE_PREFIX', 'BAD_VALUE', cb);
      });

      it('can be searched', function(done) {
        done();
      });

    });

  });

});
