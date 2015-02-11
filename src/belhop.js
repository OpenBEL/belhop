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
  var _badfcall = 'invalid function call';
  var _ufo = 'unidentified object';
  var _haljson = 'application/hal+json';

  function _NO_OP() {}

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

  function _Ex(message, args, required) {
    this.name = 'BELHopException';
    var msg = message;
    var cause = null;
    if (required >= args.length) {
      msg += ' (bad arity: ';
      msg += args.length + ' of ' + required + ' given)';
    }
    this.message = msg;
    this.args = args;
    this.required = required;
    this.given = args.length;
  }
  _Ex.prototype = Object.create(Error.prototype);
  _Ex.prototype.constructor = _Ex;

  function _hasself(obj) {
    // the openbel server API uses HAL so...
    // ... does obj support HAL?
    var _links = obj._links;
    if (typeof _links === 'undefined' || _links === null) {
      // ... nope it's a UFO.
      return false;
    }
    // ... does obj know itself?
    var self = _links.self;
    if (typeof self === 'undefined' || self === null) {
      // ... know thyself... Socrates?
      return false;
    }
    // ... does self href?
    var href = self.href;
    if (typeof href === 'undefined' || href === null) {
      return false;
    }
    return true;
  }

  function _self(apiurl, obj) {
    var errmsg = '';
    if (!_hasself(obj)) {
      throw _Ex(_ufo, arguments, 1);
    }
    var self = obj._links.self.href;

    // We're very pedantic about the 'self' of an object to force proper use
    // of the API with single objects (vice collections, etc.). The self is
    // broken apart here to make sure it identifies a single object in the API.
    // root resource?
    if (self.slice(-1) === '/') {
      // prevent dereferencing as self
      errmsg = 'unexpected self: ' + self;
      throw _Ex(errmsg, arguments, 1);
    }
    // 'http://host/api/resource/id' -> '/resource/id'
    var path = self.replace(apiurl, '');
    // '/resource/id' -> ['', 'resource', 'id']
    var tokens = path.split('/');
    if (tokens.length < 3) {
      // prevent dereferencing as self
      errmsg = 'unexpected self: ' + self;
      throw _Ex(errmsg, arguments, 1);
    }
    return self;
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
   * @property {?string} id The evidence identifier (if previously created)
   * @property {string} bel_statement Represents the biological knowledge
   * @property {Citation} citation Source of the biological knowledge
   * @property {object} [biological_context] Where the interaction was observed
   * @property {string} [summary_text] Abstract from source text
   * @property {object} [metadata] Additional key-value details
   * @see belhop.evidence
   */

   /**
    * BELHop evidence citation type definition.
    * These types can be created in {@link belhop.factory the factory}.
    *
    * @name Citation
    * @typedef {Citation} Citation
    * @property {string} id Identifies the citation
    * @property {string} type One of the following: PubMed, Book, Journal,
    * Online Resource, or Other
    * @property {string} [name] Name of the citation
    * @property {string} [date] Date of the citation
    * (in {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601 format})
    * @property {string} [comment] Citation comment
    */

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
   * No further options are available.
   */
  function apiHEAD(path, cb) {
    var url = belhop.configuration.getAPIURL();
    // append the path
    path = encodeURI(path);
    url += path;

    var ajaxOptions = {
      type: 'HEAD',
      url: url,
      success: cb.success,
      error: cb.error
    };
    $.ajax(ajaxOptions);
  }

  /*
   * The options hash can handle queryParams and accept keys.
   * (call with url OR path, not both)
   */
  function apiGET(url, path, cb, options) {
    if (url === null) {
      url = belhop.configuration.getAPIURL();
      // append the path
      path = encodeURI(path);
      url += path;
    }

    // setup the options to our AJAX get
    var defaultOptions = {
      queryParams: null,
      accept: null
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

    if (argOptions.accept !== null) {
      ajaxOptions.headers = { Accept: argOptions.accept };
    }
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
   * The options hash can handle queryParams and contentType keys.
   * (call with url OR path, not both)
   */
  function apiPUT(url, path, data, cb, options) {
    if (url === null) {
      url = belhop.configuration.getAPIURL();
      // append the path
      path = encodeURI(path);
      url += path;
    }

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
      type: 'PUT',
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
   * (call with url OR path, not both)
   */
  function apiDELETE(url, path, cb) {
    if (url === null) {
      url = belhop.configuration.getAPIURL();
      // append the path
      path = encodeURI(path);
      url += path;
    }

    var ajaxOptions = {
      type: 'DELETE',
      url: url,
      success: cb.success,
      error: cb.error
    };
    $.ajax(ajaxOptions);
  }

  belhop.__ = {};

  belhop.__.self = function(obj) {
    var apiurl = belhop.configuration.getAPIURL();
    return _self(apiurl, obj);
  };

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
   * Verify the library configuration and server availability.
   *
   * @function
   * @name belhop.configuration.test
   *
   * @param {Callback} cb
   * @tutorial configuration-test
   */
  belhop.configuration.test = function(cb) {
    apiHEAD('', cb);
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
    var actions = completion.actions;
    actions.forEach(actOn);
    return input;
  };

  /**
   * @namespace belhop.factory
   */
  belhop.factory = {};

  /**
   * Create a callback.
   * See the {@link Callback type} this factory produces for more.
   *
   * @function
   * @name belhop.factory.callback
   *
   * @param {function} success - Function to call on success
   * @param {function} error - Function to call on error
   *
   * @return {Callback}
   * @see belhop.factory.callbackNoErrors
   * @see belhop.factory.callbackNoSuccess
   */
  belhop.factory.callback = function(success, error) {
    return {
      success: success,
      error: error
    };
  };

  /**
   * Create a callback that treats errors as a no-op.
   *
   * @function
   * @name belhop.factory.callbackNoErrors
   *
   * @param {function} success - Function to call on success
   *
   * @return {Callback}
   * @see belhop.factory.callback
   * @see belhop.factory.callbackNoSuccess
   */
  belhop.factory.callbackNoErrors = function(success) {
    return {
      success: success,
      error: _NO_OP
    };
  };

  /**
   * Create a callback that treats success as a no-op.
   * See the {@link Callback type} this factory produces for more.
   *
   * @function
   * @name belhop.factory.callbackNoSuccess
   *
   * @param {function} error - Function to call on error
   *
   * @return {Callback}
   * @see belhop.factory.callback
   * @see belhop.factory.callbackNoErrors
   */
  belhop.factory.callbackNoSuccess = function(error) {
    return {
      success: _NO_OP,
      error: error
    };
  };

  /**
   * Evidence factory.
   * See the {@link Evidence type} this factory produces for more.
   *
   * @function
   * @name belhop.factory.evidence
   *
   * @param {!string} stmt Soure/Relationship/Target string
   * @param {!Citation} citation
   * @param {?object} ctxt
   * @param {?string} summary
   * @param {?object} meta
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
   * Citation factory.
   * See the {@link Citation type} this factory produces for more.
   *
   * @function
   * @name belhop.factory.citation
   *
   * @param {!string} type
   * @param {?object} arg2 Argument two
   * @param {object} [arg3] Argument three
   *
   * @return {Citation}
   */
  belhop.factory.citation = function() {

  };

  /**
   * Gets completions for the given input and returns the results.
   *
   * @function
   * @name belhop.complete.getCompletions
   *
   * @param {string} input - BEL expression to autocomplete.
   * @param {number} caretPosition - optional caret position
   * @param {Callback} cb
   *
   * @return {Completion} zero or more completions
   */
  belhop.complete.getCompletions = function(input, caretPosition, cb) {
    var path = '/expressions/' + input + '/completions';
    var options = {};
    if (typeof caretPosition !== 'undefined' && caretPosition !== null) {
      options.queryParams = 'caret_position=' + caretPosition;
    }
    apiGET(null, path, cb, options);
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
   * @see Evidence The type used by this namespace.
   */
  belhop.evidence = {};

  /**
   * Create new evidence.
   *
   * @function
   * @name belhop.evidence.create
   *
   * @param {!Evidence} evidence Evidence to create
   * @param {!Callback} cb
   */
  belhop.evidence.create = function(evidence, cb) {
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
   * Get evidence.
   * Invokes the callback functions in the <b>cb</b> parameter.
   *
   * @function
   * @name belhop.evidence.get
   *
   * @param {?string} id Evidence to get
   * @param {number} [start=0] Page to start from
   * @param {number} [size=<em>all</em>] Number to retrieve
   * @param {Callback} cb
   */
  belhop.evidence.get = function(id, start, size, cb) {
    if (_invalid(cb)) { throw new _Ex(_badfcall, arguments, 1); }
    var path = '/evidence';
    if (id !== null) path += '/' + id;
    var options = {
      accept: _haljson
    };

    // intercept on success...
    function success(data, status, request) {
      // ... dig into evidence, we only want the content.
      var evidenceArr = data.evidence;
      cb.success(evidenceArr, status, request);
      return;
    }
    var _cb = belhop.factory.callback(success, cb.error);
    apiGET(null, path, _cb, options);
  };

  /**
   * Update evidence, saving changes.
   * Invokes the callback functions in the <b>cb</b> parameter.
   *
   * @function
   * @name belhop.evidence.update
   *
   * @param {!Evidence} evidence The evidence to update
   * @param {!Callback} cb
   */
  belhop.evidence.update = function(evidence, cb) {
    if (_invalid(evidence, cb)) { throw _Ex(_badfcall, arguments, 2); }
    // self: what are we updating (PUT href)
    var self = belhop.__.self(evidence);
    var stmt = evidence.bel_statement;
    var citation = evidence.citation;
    var ctxt = evidence.biological_context;
    var summary = evidence.summary_text;
    var meta = evidence.metadata;

    var update = belhop.factory.evidence(stmt, citation, ctxt, summary, meta);
    var data = JSON.stringify(update);

    var schemaURL = belhop.configuration.getSchemaURL();
    var profile = schemaURL + '/evidence.schema.json';
    var contentType = 'application/json;profile=' + profile;
    var options = {
      contentType: contentType
    };
    apiPUT(self, null, data, cb, options);
  };

  /**
   * Reset evidence, reverting unsaved changes.
   * Invokes the callback functions in the <b>cb</b> parameter.
   *
   * @function
   * @name belhop.evidence.reset
   *
   * @param {!Evidence} evidence The evidence to reset
   * @param {!Callback} cb
   */
  belhop.evidence.reset = function(evidence, cb) {
    if (_invalid(evidence, cb)) { throw _Ex(_badfcall, arguments, 2); }
    // self: what are we getting (GET href)
    var self = belhop.__.self(evidence);

    // intercept on success and reset evidence prior to cb
    function success(data, status, request) {
      var evidenceArr = data.evidence;
      var freshev = evidenceArr[0];
      evidence._links = freshev._links;
      evidence.bel_statement = freshev.bel_statement;
      evidence.biological_context = freshev.biological_context;
      evidence.citation = freshev.citation;
      evidence.metadata = freshev.metadata;
      cb.success(evidence, status, request);
      return;
    }
    var _cb = belhop.factory.callback(success, cb.error);
    var options = {
      accept: _haljson
    };
    apiGET(self, null, _cb, options);
  };

  /**
   * Delete evidence.
   * Invokes the callback functions in the <b>cb</b> parameter.
   *
   * @function
   * @name belhop.evidence.delete
   *
   * @param {!Evidence} evidence The evidence to delete
   * @param {!Callback} cb
   */
  belhop.evidence.delete = function(evidence, cb) {
    if (_invalid(evidence, cb)) { throw _Ex(_badfcall, arguments, 2); }
    var self = belhop.__.self(evidence);
    apiDELETE(self, null, cb);
  };

}.call(this));
