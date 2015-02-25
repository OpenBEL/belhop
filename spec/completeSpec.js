/* global describe it expect beforeEach belhop */
describe('belhop', function() {
  'use strict';

  it('can complete expressions', function() {
    expect(belhop.complete.apply).toBeDefined();
  });

  describe('completion', function() {

    it('can handle deletion actions', function() {
      var completion = {
        actions: [{
          delete: {
            start_position: 0,
            end_position: 2
          }
        }]
      };
      var input = 'fooHGNC:AKT1';
      input = belhop.complete.apply(completion, input);
      expect(input).toEqual('HGNC:AKT1');
    });

    describe('can handle inserts', function() {

      it('that prepend text', function() {
        var completion = {
          actions: [{
            insert: {
              value: 'HGNC:',
              position: 0
            }
          }]
        };
        var input = 'AKT1';
        input = belhop.complete.apply(completion, input);
        expect(input).toEqual('HGNC:AKT1');
      });

      it('can insert text in the middle', function() {
        var completion = {
          actions: [{
            insert: {
              value: 'NC',
              position: 2
            }
          }]
        };
        var input = 'HG:AKT1';
        input = belhop.complete.apply(completion, input);
        expect(input).toEqual('HGNC:AKT1');
      });

      it('can append text to the end', function() {
        var completion = {
          actions: [{
            insert: {
              value: 'AKT1',
              position: 5
            }
          }]
        };
        var input = 'HGNC:';
        input = belhop.complete.apply(completion, input);
        expect(input).toEqual('HGNC:AKT1');
      });

    });

  });

  describe('completions', function() {

    it('can get completions', function(done) {
      var onSucc = function(response) {
        expect(response.completions).toBeDefined();
        expect(response.completions.length).toBeGreaterThan(0);
        done();
      };
      var onErr = function() {
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      var input = 'p(HGNC:AK)';
      var caretPos = 9;
      expect(belhop.complete.getCompletions).toBeDefined();
      belhop.complete.getCompletions(input, caretPos, cb);
    });

  });

});
