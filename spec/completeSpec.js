describe('belhop', function() {

  it('can complete expressions', function() {
    expect(belhop.complete.apply).toBeDefined();
  });

  describe('completion', function() {

    it('can handle deletion actions', function() {
      var completion = {
        completion: {
          actions: [
            {
              delete: {
                start_position: 0,
                end_position: 2
              }
            }
          ]
        }
      };
      var input = 'fooHGNC:AKT1';
      input = belhop.complete.apply(completion, input);
      expect(input).toEqual('HGNC:AKT1');
    });

    describe('can handle inserts', function() {

      it('that prepend text', function() {
        var completion = {
            actions: [
              {
                insert: {
                  value: 'HGNC:',
                  position: 0
                }
              }
            ]
          }
        };
        var input = 'AKT1';
        input = belhop.complete.apply(completion, input);
        expect(input).toEqual('HGNC:AKT1');
      });

      it('can insert text in the middle', function() {
        var completion = {
          completion: {
            actions: [
              {
                insert: {
                  value: 'NC',
                  position: 2
                }
              }
            ]
          }
        };
        var input = 'HG:AKT1';
        input = belhop.complete.apply(completion, input);
        expect(input).toEqual('HGNC:AKT1');
      });

      it('can append text to the end', function() {
        var completion = {
          completion: {
            actions: [
              {
                insert: {
                  value: 'AKT1',
                  position: 5
                }
              }
            ]
          }
        };
        var input = 'HGNC:';
        input = belhop.complete.apply(completion, input);
        expect(input).toEqual('HGNC:AKT1');
      });

    });

  });

  describe('completions', function() {

    var completions;

    beforeEach(function(done) {
      var onSucc = function(response) {
        completions = response.completions;
        done();
      };
      var onErr = function(arg1, arg2) {
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      var input = 'p(HGNC:A)';
      var caretPos = 8;
      expect(belhop.complete.getCompletions).toBeDefined();
      belhop.complete.getCompletions(input, caretPos, cb);
    });

    it('can get completions', function(done) {
      expect(completions.length).toBeDefined();
      expect(completions.length).toBeGreaterThan(0);
      expect(completions[0]).toBeDefined();
      expect(completions[0].actions).toBeDefined();
      done();
    });

  });

});
