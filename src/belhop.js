/**
 * @file BELHop JavaScript library.
 * @author OpenBEL Committers
 * @license Apache-2.0
*/
(function() {
  'use strict';

  var root = this;
  var _defaultAPIURL = 'http://next.belframework.org/api';
  var _defaultSchemaURL = 'http://next.belframework.org/schema';

  function _invalid() {
    var x, i;
    for (i = 0; i < arguments.length; i++) {
      x = arguments[i];
      if (typeof x === 'undefined' || x === null) {
        return true;
      }
    }
    return false;
  }

  function _valid() {
    var x, i;
    for (i = 0; i < arguments.length; i++) {
      x = arguments[i];
      if (typeof x === 'undefined' || x === null) {
        return false;
      }
    }
    return true;
  }

  function _ex(message, args) {
    return {
      message: message,
      args: args
    };
  }

  // declare globals not recognized by eslint
  /* global module */
  /* global $ */

  /**
   * The BELHop module.
   * @exports belhop
   * @namespace belhop
   * @author Nick Bargnesi <nbargnesi@selventa.com>
   * @version 0.1.0
   */
  var belhop = {};

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = belhop;
  } else {
    root.belhop = belhop;
  }

  /**
   * @name DEFAULT_API_URL
   * @readonly
   * @type {string}
   * @default
   */
  Object.defineProperty(belhop, 'DEFAULT_API_URL', {
    get: function() { return _defaultAPIURL; }
  });

  /**
   * @name DEFAULT_SCHEMA_URL
   * @readonly
   * @type {string}
   * @default
   */
  Object.defineProperty(belhop, 'DEFAULT_SCHEMA_URL', {
    get: function() { return _defaultSchemaURL; }
  });

  /**
   * @name VERSION
   * @readonly
   * @type {string}
   * @default
   */
  Object.defineProperty(belhop, 'VERSION', {
    get: function() { return '0.1.0'; }
  });

  /*
   * The options hash can handle a queryParams key.
   */
  function apiGET(path, cb, options) {
    var url = belhop.configuration.getAPIURL();
    // append the path
    path = encodeURI(path);
    url += path;

    // setup the options to our AJAX get
    var defaultOptions = {
      queryParams: null
    };
    var argOptions = $.extend(defaultOptions, options || {});

    if (argOptions.queryParams !== null) {
      // append query parameters
      url += '?' + argOptions.queryParams;
    }

    var ajaxOptions = {
      url: url,
      success: cb.success,
      error: cb.error
    };
    $.ajax(ajaxOptions);
  }

  /*
   * The options hash can handle queryParams and contentType keys.
   */
  function apiPOST(path, data, cb, options) {
    var url = belhop.configuration.getAPIURL();
    // append the path
    path = encodeURI(path);
    url += path;

    // setup the options to our AJAX post
    var defaultOptions = {
      queryParams: null,
      contentType: null
    };
    var argOptions = $.extend(defaultOptions, options || {});

    if (argOptions.queryParams !== null) {
      // append query parameters
      url += '?' + argOptions.queryParams;
    }

    var ajaxOptions = {
      type: 'POST',
      url: url,
      data: data,
      success: cb.success,
      error: cb.error
    };

    if (argOptions.contentType !== null) {
      ajaxOptions.contentType = argOptions.contentType;
    }
    $.ajax(ajaxOptions);
  }

  /*
   */
  function apiDELETE(path, cb) {
    var url = belhop.configuration.getAPIURL();
    // append the path
    path = encodeURI(path);
    url += path;

    var ajaxOptions = {
      type: 'DELETE',
      url: url,
      success: cb.success,
      error: cb.error
    };
    $.ajax(ajaxOptions);
  }

  /**
   * @namespace belhop.configuration
   */
  belhop.configuration = {};

  /**
   * Get the current API URL.
   *
   * @function
   * @name belhop.configuration.getAPIURL
   *
   * @example
   * > belhop.configuration.getAPIURL()
   * 'http://next.belframework.org/api'
   *
   * @return {string} Current API URL
   */
  belhop.configuration.getAPIURL = function() {
    var url = belhop.currentAPIURL;
    if (typeof url === 'undefined' || url === null) {
      return belhop.DEFAULT_API_URL;
    }
    return belhop.currentAPIURL;
  };

  /**
   * Set the API URL.
   *
   * @function
   * @name belhop.configuration.setAPIURL
   *
   * @param {string} url - The API URL to use
   *
   * @example
   * > // reset to the default URL
   * > belhop.configuration.setAPIURL(null);
   */
  belhop.configuration.setAPIURL = function(url) {
    belhop.currentAPIURL = url;
  };

  /**
   * Get the current schema URL.
   *
   * @function
   * @name belhop.configuration.getSchemaURL
   *
   * @example
   * > belhop.configuration.getSchemaURL()
   * 'http://next.belframework.org/schema'
   *
   * @return {string} Current schema URL
   */
  belhop.configuration.getSchemaURL = function() {
    var url = belhop.currentSchemaURL;
    if (typeof url === 'undefined' || url === null) {
      return belhop.DEFAULT_SCHEMA_URL;
    }
    return belhop.currentSchemaURL;
  };

  /**
   * Set the schema URL.
   *
   * @function
   * @name belhop.configuration.setSchemaURL
   *
   * @param {string} url - The schema URL to use
   *
   * @example
   * > // reset to the default URL
   * > belhop.configuration.setSchemaURL(null);
   */
  belhop.configuration.setSchemaURL = function(url) {
    belhop.currentSchemaURL = url;
  };

  /**
   * @namespace belhop.complete
   */
  belhop.complete = {};

  /**
   * Applies a completion to the input and returns the result.
   * @namespace belhop.complete
   *
   * @function
   * @name belhop.complete.apply
   *
   * @param {object} completion - BEL API completion object.
   * @param {string} input - BEL expression to autocomplete.
   *
   * @return {string} Completed input string.
   */
  belhop.complete.apply = function(completion, input) {
    /* applies a single action */
    function actOn(action) {
      if (action.delete) {
        var startPos = action.delete.start_position;
        var endPos = action.delete.end_position;
        input = belhop.complete.actions.delete(input, startPos, endPos);
      } else if (action.insert) {
        var value = action.insert.value;
        var position = action.insert.position;
        input = belhop.complete.actions.insert(input, value, position);
      }
    }
    /* apply each action, mutating input */
    // looks odd but "completion" is a key in the actual completion object
    var actions = completion.completion.actions;
    actions.forEach(actOn);
    return input;
  };

  /**
  * BELHop completion type definition.
  * @name Completion
  * @typedef {Completion} Completion
  * @property {array} actions - The completion actions.
  * @property {string} value - The completion value (the proposal).
  * @property {string} label - Expanded representation of the value.
  * @property {string} type - The type of the completion (provided by the API).
  */

  /**
   * BELHop callback type definition.
   * These types can be created in {@link belhop.factory the factory}.
   *
   * @name Callback
   * @typedef {Callback} Callback
   * @property {function} success - Function called on success. This function
   * is called with the response data, status string, and original request (in
   * that order).
   * @property {function} error - Function called on error. This function
   * is called with the original request, error string, and exception object
   * if one occurred (in that order).
   *
   * @example
   * // no-op callback, w/ function arguments for clarity
   * var cb = {
   *   success: function(responseData, statusString, request) {},
   *   error: function(request, errorString, exception) {}
   * };
   */

  /**
   * BELHop evidence type definition.
   * These types can be created in {@link belhop.factory the factory}.
   *
   * @name Evidence
   * @typedef {Evidence} Evidence
   * @property {string} id - The evidence identifier (if previously created)
   * @property {string} bel_statement - Represents the biological knowledge
   * @property {object} citation - Source of the biological knowledge
   * @property {object} biological_context - Details on where the interaction
   * was observed
   * @property {string} summary_text - Abstract from source text
   * @property {object} metadata - Additional details about the evidence
   * @see belhop.evidence
   */

  /**
   * @namespace belhop.factory
   */
  belhop.factory = {};

  /**
   * Callback factory.
   *
   * @function
   * @name belhop.factory.callback
   *
   * @param {string} stmt - The source/relationship/target string
   * @param {object} citation - Source of the biological knowledge
   * @param {object} ctxt - Details on where the interaction was observed
   * @param {string} summary - Abstract from source text
   * @param {object} meta - Additional details about the evidence
   *
   * @return {Callback}
   */
  belhop.factory.callback = function(success, error) {
    return {
      success: success,
      erorr: error
    };
  };

  /**
   * Evidence factory.
   *
   * @function
   * @name belhop.factory.evidence
   *
   * @param {string} stmt - The source/relationship/target string
   * @param {object} citation - Source of the biological knowledge
   * @param {object} ctxt - Details on where the interaction was observed
   * @param {string} summary - Abstract from source text
   * @param {object} meta - Additional details about the evidence
   *
   * @return {Evidence}
   */
  belhop.factory.evidence = function(stmt, citation, ctxt, summary, meta) {
    return {
      evidence: {
        bel_statement: stmt,
        citation: citation,
        biological_context: ctxt,
        summary_text: summary,
        metadata: meta
      }
    };
  };

  /**
   * Gets completions for the given input and returns the results.
   *
   * @function
   * @name belhop.complete.getCompletions
   *
   * @param {string} input - BEL expression to autocomplete.
   * @param {number} caretPosition - optional caret position
   * @param {Callback} cb - callback with success and error functions
   *
   * @return {Completion} zero or more completions
   */
  belhop.complete.getCompletions = function(input, caretPosition, cb) {
    var path = '/expressions/' + input + '/completions';
    var options = {};
    if (typeof caretPosition !== 'undefined' && caretPosition !== null) {
      options.queryParams = 'caret_position=' + caretPosition;
    }
    apiGET(path, cb, options);
  };

  /**
   * @namespace belhop.complete.actions
   */
  belhop.complete.actions = {};

  /**
   * Delete the characters from startPos to endPos inclusively and return the
   * result.
   *
   * @protected
   * @function
   * @name belhop.complete.actions.delete
   *
   * @param {string} str - Input string to operate on.
   * @param {number} startPos - Starting position of the deletion range.
   * @param {number} endPos - Ending position of the deletion range.
   *
   * @example
   * > // delete "JUNK" from input
   * > belhop.complete.actions.delete('fooJUNKbar', 3, 6);
   * 'foobar'
   *
   * @return {string} Input string after deletion operation.
   */
  belhop.complete.actions.delete = function(str, startPos, endPos) {
    var str1 = str.substr(0, startPos);
    var str2 = str.substr(endPos + 1);
    var ret = str1 + str2;
    return ret;
  };

  /**
   * Insert the string value at position and return the result.
   *
   * @protected
   * @function
   * @name belhop.complete.actions.insert
   *
   * @param {string} str - Input string to operate on.
   * @param {string} value - String to insert.
   * @param {number} position - Insertion position.
   *
   * @example
   * > // insert "bar" into input
   * > belhop.complete.actions.insert('foo', 'bar', 3);
   * 'foobar'
   *
   * @return {string} Input string after insertion operation.
   */
  belhop.complete.actions.insert = function(str, value, position) {
    var str1 = str.substr(0, position);
    var str2 = value;
    var str3 = str.substr(position);
    var rslt = str1 + str2 + str3;
    return rslt;
  };

  /**
   * @namespace belhop.validate
   */
  belhop.validate = {};

  /**
   * Insert the string value at position and return the result.
   *
   * @function
   * @name belhop.validate.syntax
   *
   * @param {string} str - Input string to operate on.
   * @param {string} value - String to insert.
   * @param {number} position - Insertion position.
   *
   * @return {Object}
   */
  belhop.validate.syntax = function(input) {
    return {};
  };

  /**
   * Insert the string value at position and return the result.
   *
   * @function
   * @name belhop.validate.semantics
   *
   * @param {string} str - Input string to operate on.
   * @param {string} value - String to insert.
   * @param {number} position - Insertion position.
   *
   * @return {Object}
   */
  belhop.validate.semantics = function(input) {
    return {};
  };

  /**
   * @namespace belhop.evidence
   */
  belhop.evidence = {};

  /**
   * Create new evidence by its component parts.
   *
   * @function
   * @name belhop.evidence.create
   *
   * @param {string} stmt - The source/relationship/target string
   * @param {object} citation - Source of the biological knowledge
   * @param {object} ctxt - Details on where the interaction was observed
   * @param {string} summary - Abstract from source text
   * @param {object} meta - Additional details about the evidence
   * @param {Callback} cb - callback with success and error functions
   */
  belhop.evidence.create = function(stmt, citation, ctxt, summary, meta, cb) {
    var evidence = belhop.factory.evidence(
      stmt, citation, ctxt, summary, meta);
    belhop.evidence.createEvidence(evidence, cb);
  };

  /**
   * Create or update evidence, depending on whether it has an id.
   *
   * @function
   * @name belhop.evidence.createEvidence
   *
   * @param {Evidence} evidence - Evidence to create or update
   * @param {Callback} cb - callback with success and error functions
   */
  belhop.evidence.createEvidence = function(evidence, cb) {
    var path = '/evidence';
    var data = JSON.stringify(evidence);

    var schemaURL = belhop.configuration.getSchemaURL();
    var profile = schemaURL + '/evidence.schema.json';
    var contentType = 'application/json;profile=' + profile;
    var options = {
      contentType: contentType
    };
    apiPOST(path, data, cb, options);
  };

  /**
   * Get evidence by its id. On success, the callback's success function will
   *
   * @function
   * @name belhop.evidence.get
   *
   * @property {string} id - The evidence identifier to remove
   * @param {Callback} cb - callback with success and error functions
   */
  belhop.evidence.get = function(id, cb) {
    var path = '/evidence/' + id;
    apiGET(path, cb);
  };

  /**
   * Remove evidence by its id.
   *
   * @function
   * @name belhop.evidence.remove
   *
   * @property {string} id - The evidence identifier to remove
   * @param {Callback} cb - callback with success and error functions
   */
  belhop.evidence.remove = function(id, cb) {
    if (typeof id === 'undefined' || id === null) {
      cb.invalid();
      return;
    }
    var path = '/evidence/' + id;
    apiDELETE(path, cb);
  };

  /**
   * Remove evidence.
   *
   * @function
   * @name belhop.evidence.removeEvidence
   *
   * @param {Evidence} evidence - Evidence to create or update
   * @param {Callback} cb - callback with success and error functions
   */
  belhop.evidence.removeEvidence = function(evidence, cb) {
    var id = evidence.id;
    belhop.evidence.remove(id, cb);
  };

}.call(this));
