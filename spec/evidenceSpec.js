describe('belhop', function() {

  describe('evidence', function() {

    var evidenceLocation;

    beforeEach(function(done) {
      var onSuccess = function(response, status, xhr) {
        evidenceLocation = xhr.getResponseHeader('location');
        done();
      };
      var onErr = function(xhr, status) {
        console.log('evidence creation failed');
        console.log(status);
        done();
      };
      var cb = {success: onSuccess, error: onErr};
      expect(belhop.evidence.create).toBeDefined();
      var statement = 'p(belhopEvidence) increases p(canBeCreated)';
      var citation = {type: 'PubMed', name: 'None', id: '10022765'};
      var ctxt = {Species: 9606, Cell: 'fibroblast'};
      var summary = 'Found this on a post-it near a sciency looking person.';
      var meta = {status: 'draft'};
      belhop.evidence.create(statement, citation, ctxt, summary, meta, cb);
    });

    it('can be created', function() {
      expect(evidenceLocation).toBeDefined();
      expect(evidenceLocation).not.toBeNull();
    });

  });

});
