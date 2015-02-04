describe('belhop', function() {

  // TODO: cleanup after we make a mess ;)
  var locations = [];
  var evidenceLocation = null;

  describe('evidence can be created from', function() {

    beforeEach(function(done) {
      var onSuccess = function(response, status, xhr) {
        evidenceLocation = xhr.getResponseHeader('location');
        locations.push(evidenceLocation);
        done();
      };
      var onErr = function(xhr, status) {
        evidenceLocation = null;
        console.log('evidence creation failed');
        console.log(status);
        done();
      };
      var cb = {success: onSuccess, error: onErr};
      expect(belhop.evidence.create).toBeDefined();
      var statement = 'p(belhopEvidence) increases p(createdFromParts)';
      var citation = {type: 'PubMed', name: 'None', id: '10022765'};
      var ctxt = {Species: 9606, Cell: 'fibroblast'};
      var summary = 'Found this on a post-it near a sciency looking person.';
      var meta = {status: 'draft'};
      belhop.evidence.create(statement, citation, ctxt, summary, meta, cb);
    });

    it('parts', function() {
      expect(evidenceLocation).not.toBeNull();
    });

  });

  describe('evidence can be created from', function() {

    beforeEach(function(done) {
      var onSuccess = function(response, status, xhr) {
        evidenceLocation = xhr.getResponseHeader('location');
        locations.push(evidenceLocation);
        done();
      };
      var onErr = function(xhr, status) {
        evidenceLocation = null;
        console.log('evidence creation failed');
        console.log(status);
        done();
      };
      var cb = {success: onSuccess, error: onErr};
      expect(belhop.evidence.createEvidence).toBeDefined();

      var statement = 'p(belhopEvidence) increases p(createdFromObjects)';
      var citation = {type: 'PubMed', name: 'None', id: '10022765'};
      var ctxt = {Species: 9606, Cell: 'fibroblast'};
      var summary = 'Found this on a post-it near a sciency looking person.';
      var meta = {status: 'draft'};
      var args = [statement, citation, ctxt, summary, meta];
      var evidence = belhop.factory.Evidence(
        statement, citation, ctxt, summary, meta);
      belhop.evidence.createEvidence(evidence, cb);
    });

    it('objects', function() {
      expect(evidenceLocation).not.toBeNull();
    });

  });

});
