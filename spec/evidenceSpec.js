describe('belhop', function() {

  var locations = [];
  var evidence = null;

  describe('evidence can be', function() {

    it('created', function(done) {
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(201);
        evidenceLocation = xhr.getResponseHeader('location');
        locations.push(evidenceLocation);
        done();
      };
      var onErr = function(xhr, status) {
        expect(xhr.status).toEqual(201);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.create).toBeDefined();
      var statement = 'p(evidence) increases p(canBeCreated)';
      var citation = {type: 'PubMed', name: 'None', id: '10022765'};
      var ctxt = {Species: 9606, Cell: 'fibroblast'};
      var summary = 'Found this on a post-it near a sciency looking person.';
      var meta = {status: 'draft'};
      var evidence = belhop.factory.evidence(statement, citation, ctxt,
          summary, meta);
      belhop.evidence.create(evidence, cb);
    });

    it('retrieved', function(done) {
      expect(locations.length).toEqual(1);
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(200);
        evidence = response[0];
        done();
      };
      var onErr = function(xhr, status) {
        expect(xhr.status).toEqual(200);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.get).toBeDefined();
      var tokens = locations[0].split('/');
      var id = tokens.slice(-1)[0];
      belhop.evidence.get(id, null, null, cb);
    });

    it('reset', function(done) {
      expect(evidence).not.toBeNull();
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(200);
        expect(evidence.bel_statement).toEqual(oldstmt);
        done();
      };
      var onErr = function(xhr, status) {
        expect(xhr.status).toEqual(200);
        done();
      };
      var oldstmt = evidence.bel_statement;
      var newstmt = 'a foo that bars';
      evidence.bel_statement = newstmt;
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.reset).toBeDefined();
      belhop.evidence.reset(evidence, cb);
    });

    it('updated', function(done) {
      expect(evidence).not.toBeNull();
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(202);
        done();
      };
      var onErr = function(xhr, status) {
        expect(xhr.status).toEqual(202);
        done();
      };
      var newstmt = 'p(evidence) increases p(canBeUpdated)';
      evidence.bel_statement = newstmt;
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.update).toBeDefined();
      belhop.evidence.update(evidence, cb);
    });

    it('deleted', function(done) {
      expect(evidence).not.toBeNull();
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(202);
        done();
      };
      var onErr = function(xhr, status) {
        expect(xhr.status).toEqual(202);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.delete).toBeDefined();
      belhop.evidence.delete(evidence, cb);
    });

  });

});
