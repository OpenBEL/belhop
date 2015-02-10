describe('belhop', function() {

  var locations = [];
  var evidenceLocation = null;

  describe('evidence can be created from', function() {

    beforeEach(function(done) {
      var onSucc = function(response, status, xhr) {
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
      var cb = belhop.factory.callback(onSucc, onErr);
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

    afterEach(function(done) {
      locations.forEach(function(location) {
        var id = location.split('/').slice(-1);
        var success = function() { done(); };
        var cb = belhop.factory.callbackNoErrors(success);
        belhop.evidence.remove(id, cb);
      });
    });

  });

  describe('evidence can be created from', function() {

    beforeEach(function(done) {
      var onSucc = function(response, status, xhr) {
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
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.createEvidence).toBeDefined();

      var statement = 'p(belhopEvidence) increases p(createdFromObjects)';
      var citation = {type: 'PubMed', name: 'None', id: '10022765'};
      var ctxt = {Species: 9606, Cell: 'fibroblast'};
      var summary = 'Found this on a post-it near a sciency looking person.';
      var meta = {status: 'draft'};
      var args = [statement, citation, ctxt, summary, meta];
      var evidence = belhop.factory.evidence(
        statement, citation, ctxt, summary, meta);
      belhop.evidence.createEvidence(evidence, cb);
    });

    it('objects', function() {
      expect(evidenceLocation).not.toBeNull();
    });

  });

});
