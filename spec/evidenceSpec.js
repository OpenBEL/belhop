/* global describe it expect belhop */
describe('belhop', function() {
  'use strict';

  var locations = [];
  var createdEvidence = null;
  var retrievedEvidence = null;
  var expected = null;
  var actual = null;

  describe('evidence', function() {

    it('can be created', function(done) {
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(201);
        var evidenceLocation = xhr.getResponseHeader('location');
        locations.push(evidenceLocation);
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(201);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.create).toBeDefined();
      var statement = 'p(evidence) increases p(canBeCreated)';
      var citation = {type: 'PubMed', name: 'None', id: '10022765'};
      var ctxt = [
        {name: 'Species', value: [9606, 10090]},
        {name: 'Cell', value: ['fibroblast', 'leukocyte']}
      ];
      var summary = 'Found this on a post-it near a sciency looking person.';
      var meta = {status: 'draft'};
      var factory = belhop.factory.evidence;
      var ev = factory(statement, citation, ctxt, summary, meta);
      createdEvidence = ev;
      belhop.evidence.create(ev, cb);
    });

    it('can be retrieved', function(done) {
      expect(locations.length).toEqual(1);
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(200);
        retrievedEvidence = response[0];
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(200);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.get).toBeDefined();
      var tokens = locations[0].split('/');
      var id = tokens.slice(-1)[0];
      belhop.evidence.get(id, null, null, cb);
    });

    it('is equivalent between client and server', function() {
      expect(createdEvidence).toBeDefined();
      expect(createdEvidence).not.toBeNull();
      expect(retrievedEvidence).toBeDefined();
      expect(retrievedEvidence).not.toBeNull();

      expected = createdEvidence.bel_statement;
      actual = retrievedEvidence.bel_statement;
      expect(expected).toEqual(actual);

      expected = createdEvidence.citation;
      actual = retrievedEvidence.citation;
      expect(expected).toEqual(actual);

      expected = createdEvidence.biological_context;
      actual = retrievedEvidence.biological_context;
      expect(expected).toEqual(actual);

      expected = createdEvidence.metadata;
      actual = retrievedEvidence.metadata;
      expect(expected).toEqual(actual);

      expected = createdEvidence.summary_text;
      actual = retrievedEvidence.summary_text;
      expect(expected).toEqual(actual);
    });

    it('can be reset', function(done) {
      expect(retrievedEvidence).not.toBeNull();
      var oldstmt = retrievedEvidence.bel_statement;
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(200);
        expect(retrievedEvidence.bel_statement).toEqual(oldstmt);
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(200);
        done();
      };
      var newstmt = 'a foo that bars';
      retrievedEvidence.bel_statement = newstmt;
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.reset).toBeDefined();
      belhop.evidence.reset(retrievedEvidence, cb);
    });

    it('can be updated', function(done) {
      expect(retrievedEvidence).not.toBeNull();
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(202);
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(202);
        done();
      };
      var newstmt = 'p(evidence) increases p(canBeUpdated)';
      retrievedEvidence.bel_statement = newstmt;
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.update).toBeDefined();
      belhop.evidence.update(retrievedEvidence, cb);
    });

    it('can be deleted', function(done) {
      expect(retrievedEvidence).toBeDefined();
      expect(retrievedEvidence).not.toBeNull();
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(202);
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(202);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.delete).toBeDefined();
      belhop.evidence.delete(retrievedEvidence, cb);

    });

  });

});
