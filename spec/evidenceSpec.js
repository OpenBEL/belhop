/* global describe it expect belhop */
describe('belhop', function() {
  'use strict';

  var locations = [];
  var createdEvidence = null;
  var retrievedEvidence = null;
  var expected = null;
  var actual = null;
  var factory = null;

  describe('evidence', function() {

    it('can be created minimally', function() {
      var citation = belhop.factory.citation(10022765, 'PubMed');
      var statement = 'p(evidenceCreated) increases p(Minimally)';
      factory = belhop.factory.evidence;
      var ev = factory(statement, citation);
      expect(ev.bel_statement).toEqual(statement);
      expect(ev.citation).toEqual(citation);
    });

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
      factory = belhop.factory.evidence;
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
      belhop.evidence.get(id, cb);
    });

    it('can be retrieved when not there', function(done) {
      var onSucc = function(evidence, status, xhr) {
        expect(xhr.status).toEqual(404);
        expect(evidence).toBeNull();
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(200);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);
      expect(belhop.evidence.get).toBeDefined();
      belhop.evidence.get('proof-of-the-yeti', cb);
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

    it('can be searched using default options', function(done) {
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(200);
        // docs say evidence and facets are in response object
        expect(response.evidence).toBeDefined();
        expect(response.facets).toBeDefined();
        // default options won't return more than 10 things
        expect(response.evidence.length).not.toBeGreaterThan(10);
        // default options do not facet responses
        expect(response.facets.length).toEqual(0);
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(200);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);

      // generic search
      factory = belhop.factory.options.search.default;
      var searchOptions = factory('cell');
      expect(belhop.evidence.search).toBeDefined();
      belhop.evidence.search(searchOptions, cb);
    });

    it('can be searched using evidence options', function(done) {
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(200);
        // docs say evidence and facets are in response object
        expect(response.evidence).toBeDefined();
        expect(response.facets).toBeDefined();
        // our default options shouldn't return more than 100 things
        expect(response.evidence.length).not.toBeGreaterThan(100);
        // our options should include faceted responses
        expect(response.facets.length).toBeGreaterThan(0);
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(200);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);

      // generic search with evidence tuning (larger size, etc.)
      var filterFactory = belhop.factory.options.filter.default;
      var searchFactory = belhop.factory.options.search.evidence;
      var filter = filterFactory('cell');
      var searchOptions = searchFactory(filter, null, null, true);
      expect(belhop.evidence.search).toBeDefined();
      belhop.evidence.search(searchOptions, cb);
    });

    it('can be searched using custom options', function(done) {
      var onSucc = function(response, status, xhr) {
        expect(xhr.status).toEqual(200);
        // docs say evidence and facets are in response object
        expect(response.evidence).toBeDefined();
        expect(response.facets).toBeDefined();
        // our options shouldn't return more than 20 things
        expect(response.evidence.length).not.toBeGreaterThan(20);
        // our options should include faceted responses
        expect(response.facets.length).toBeGreaterThan(0);
        done();
      };
      var onErr = function(xhr) {
        expect(xhr.status).toEqual(200);
        done();
      };
      var cb = belhop.factory.callback(onSucc, onErr);

      // custom search with start offset 40, size 20, faceting, and filter
      var filterFactory = belhop.factory.options.filter.custom;
      var searchFactory = belhop.factory.options.search.evidence;
      var filter = filterFactory('biological_context', 'Species', '10090');
      var searchOptions = searchFactory(filter, 40, 20, true);
      expect(belhop.evidence.search).toBeDefined();
      belhop.evidence.search(searchOptions, cb);
    });

    describe('annotations', function() {

      it('can be added by name/value', function() {
        var statement = 'p(annos) increases p(canBeAddedNV)';
        var citation = {type: 'PubMed', name: 'None', id: '10022765'};
        factory = belhop.factory.evidence;
        var ev = factory(statement, citation);

        expect(belhop.evidence.annotation.addNameValue).toBeDefined();
        var add = belhop.evidence.annotation.addNameValue;

        expect(belhop.factory.annotations.nameValue).toBeDefined();
        factory = belhop.factory.annotations.nameValue;

        add(ev, factory('THE_NAME', 'THE_VALUE'));
        expect(ev.biological_context).toBeDefined();
        var ctxt = ev.biological_context;
        expect(ctxt.length).toEqual(1);
        expect(ctxt[0].name).toEqual('THE_NAME');
        expect(ctxt[0].value).toEqual('THE_VALUE');
      });

      it('can be added by type', function() {
        var statement = 'p(annos) increases p(canBeAddedNV)';
        var citation = {type: 'PubMed', name: 'None', id: '10022765'};
        factory = belhop.factory.evidence;
        var ev = factory(statement, citation);

        expect(belhop.evidence.annotation.addType).toBeDefined();
        var add = belhop.evidence.annotation.addType;

        expect(belhop.factory.annotations.type).toBeDefined();
        factory = belhop.factory.annotations.type;

        var type = factory('NAME', 'PREFIX', 'DOMAIN', 'URI');
        add(ev, type, 'THE_VALUE');
        expect(ev.biological_context).toBeDefined();
        var ctxt = ev.biological_context;
        expect(ctxt.length).toEqual(1);
        expect(ctxt[0].name).toEqual('PREFIX');
        expect(ctxt[0].value).toEqual('THE_VALUE');
      });

      it('can be added by value', function() {
        var statement = 'p(annos) increases p(canBeAddedNV)';
        var citation = {type: 'PubMed', name: 'None', id: '10022765'};
        factory = belhop.factory.evidence;
        var ev = factory(statement, citation);

        expect(belhop.evidence.annotation.addAnnotation).toBeDefined();
        var add = belhop.evidence.annotation.addAnnotation;

        expect(belhop.factory.annotations.value).toBeDefined();
        factory = belhop.factory.annotations.value;

        var value = factory('IDENTIFIER', 'NAME', 'TYPE', 'URI');
        add(ev, value);
        expect(ev.biological_context).toBeDefined();
        var ctxt = ev.biological_context;
        expect(ctxt.length).toEqual(1);
        expect(ctxt[0]).toEqual('URI');
      });

      it('can be added by annotation search results', function(done) {
        var statement = 'p(annos) increases p(canBeAddedNV)';
        var citation = {type: 'PubMed', name: 'None', id: '10022765'};
        factory = belhop.factory.evidence;
        var ev = factory(statement, citation);

        expect(belhop.evidence.annotation.addAnnotation).toBeDefined();
        var add = belhop.evidence.annotation.addAnnotation;

        var onSucc = function(values, status, xhr) {
          expect(xhr.status).toEqual(200);
          expect(values).not.toBeNull();
          expect(values.length).toBeGreaterThan(0);
          var value = values[0];
          add(ev, value);
          expect(ev.biological_context).toBeDefined();
          var ctxt = ev.biological_context;
          expect(ctxt.length).toEqual(1);
          expect(ctxt[0]).toEqual(value.uri);
          done();
        };
        var onErr = function(xhr) {
          expect(xhr.status).toEqual(200);
          done();
        };
        var cb = belhop.factory.callback(onSucc, onErr);
        belhop.annotations.search('9606', cb);
      });

    });

  });

});
