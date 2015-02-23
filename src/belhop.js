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
  var _badcb = 'invalid callback';
  var _ufo = 'unidentified object';
  var _haljson = 'application/hal+json';
  var _not_found = 'not found';

  function _NO_OP() {}

  function _Ex(message, args, required) {
    this.name = 'BELHopException';
    var msg = message;
    if (required !== args.length) {
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

  function _Callback(success, error) {
    var msg = 'is not a function';
    if (!success instanceof Function) {
      msg = 'success ' + msg + '(' + typeof success + ')';
      throw new Error(msg);
    }
    if (!error instanceof Function) {
      msg = 'error ' + msg + ' (' + typeof success + ')';
      throw new Error(msg);
    }
    this.success = success;
    this.error = error;
  }

  function _nonnull(x) {
    if (x !== null) {
      return true;
    }
    return false;
  }

  function _null(x) {
    if (x === null) {
      return true;
    }
    return false;
  }

  function _def(x) {
    if (x === 'undefined' || typeof x === 'undefined') {
      return false;
    }
    return true;
  }

  function _undef(x) {
    if (x === 'undefined' || typeof x === 'undefined') {
      return true;
    }
    return false;
  }

  function _defNonNull(x) {
    if (_def(x) && _nonnull(x)) {
      return true;
    }
    return false;
  }

  function _undefOrNull(x) {
    if (_undef(x) || _null(x)) {
      return true;
    }
    return false;
  }

  function _assert_args(args, required) {
    //if (_invalid(cb)) throw new _Ex(_badfcall, arguments, 3);
    var x, i;
    var msg;
    for (i = 0; i < required; i++) {
      x = args[i];
      if (_undef(typeof x) || _null(x)) {
        // validate required argument
        msg = _badfcall;
        msg += ': argument ' + (i + 1) + ' is required';
        throw new _Ex(msg, args, required);
      } else if (x instanceof _Callback) {
        // validate callback
        if (_undef(typeof x.success)) {
          msg = _badcb;
          msg += ': undefined success function';
          throw new _Ex(msg, args, required);
        } else if (!x.success instanceof Function) {
          msg = _badcb;
          msg += ': invalid success function';
          msg += ' (' + typeof x.success + ')';
          throw new _Ex(msg, args, required);
        } else if (_undef(typeof x.error)) {
          msg = _badcb;
          msg += ': undefined error function';
          throw new _Ex(msg, args, required);
        } else if (!x.error instanceof Function) {
          msg = _badcb;
          msg += ': invalid error function';
          msg += ' (' + typeof x.error + ')';
          throw new _Ex(msg, args, required);
        }
      }
    }
  }

  function _hasself(obj) {
    // the openbel server API uses HAL so...
    // ... does obj support HAL?
    var _links = obj._links;
    if (_undefOrNull(_links)) {
      // ... nope it's a UFO.
      return false;
    }
    // ... does obj know itself?
    var self = _links.self;
    if (_undefOrNull(self)) {
      // ... know thyself... Socrates?
      return false;
    }
    // ... does self href?
    var href = self.href;
    if (_undefOrNull(href)) {
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
   * BELHop annotation type definition.
   *
   * These types are controlled by the BEL API and are well-defined definitions
   * of a reusable class of common annotations. Examples of these types include
   * species and anatomy.
   *
   * @name AnnotationType
   * @typedef {AnnotationType} AnnotationType
   * @property {string} name Name suitable for display
   * @property {string} prefix Prefix uniquely identifying this type
   * @property {string} domain The domain of the annotation
   * @property {string} uri The type's URI
   * @see belhop.annotations
   */

  /**
   * BELHop generic name/value annotation type definition.
   * These types can be created in {@link belhop.factory the factory}.
   *
   * Only the form of these types is defined. No constraints are placed on the
   * name and value properties.
   *
   * @name NameValueAnnotation
   * @typedef {NameValueAnnotation} NameValueAnnotation
   * @property {string} name The annotation's name
   * @property {string} value The annotation's value
   */

  /**
   * BELHop annotation value definition.
   *
   * These types are controlled by the BEL API and are specific values
   * of a annotation types. An example here is the 9606 taxonomy identifier
   * found in the "taxon" annotation type.
   *
   * @name AnnotationValue
   * @typedef {AnnotationValue} AnnotationValue
   * @property {string} identifier Identifies the value within the type
   * @property {string} name Name suitable for display
   * @property {string} type The type of the value
   * @property {string} uri The value's URI
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
    * @property {(string|number)} id Identifies the citation
    * @property {string} type One of the following: PubMed, Book, Journal,
    * Online Resource, or Other
    * @property {string} [name] Name of the citation
    * @property {string} [date] Date of the citation
    * (in {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601 format})
    * @property {string[]} [authors] Authors of the citation
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
   * @memberof belhop.configuration
   *
   * @example
   * > belhop.configuration.getAPIURL()
   * 'http://next.belframework.org/api'
   *
   * @return {string} Current API URL
   */
  belhop.configuration.getAPIURL = function() {
    var url = belhop.currentAPIURL;
    if (_undefOrNull(url)) {
      return belhop.DEFAULT_API_URL;
    }
    return belhop.currentAPIURL;
  };

  /**
   * Set the API URL.
   *
   * @function
   * @memberof belhop.configuration
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
   * @memberof belhop.configuration
   *
   * @example
   * > belhop.configuration.getSchemaURL()
   * 'http://next.belframework.org/schema'
   *
   * @return {string} Current schema URL
   */
  belhop.configuration.getSchemaURL = function() {
    var url = belhop.currentSchemaURL;
    if (_undefOrNull(url)) {
      return belhop.DEFAULT_SCHEMA_URL;
    }
    return belhop.currentSchemaURL;
  };

  /**
   * Set the schema URL.
   *
   * @function
   * @memberof belhop.configuration
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
   * @memberof belhop.configuration
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
   * @memberof belhop.complete
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
   * @memberof belhop.factory
   *
   * @param {function} success - Function to call on success
   * @param {function} error - Function to call on error
   *
   * @return {Callback}
   * @see belhop.factory.callbackNoErrors
   * @see belhop.factory.callbackNoSuccess
   */
  belhop.factory.callback = function(success, error) {
    return new _Callback(success, error);
  };

  /**
   * Create a callback that treats errors as a no-op.
   *
   * @function
   * @memberof belhop.factory
   *
   * @param {function} success - Function to call on success
   *
   * @return {Callback}
   * @see belhop.factory.callback
   * @see belhop.factory.callbackNoSuccess
   */
  belhop.factory.callbackNoErrors = function(success) {
    return new _Callback(success, _NO_OP);
  };

  /**
   * Create a callback that treats success as a no-op.
   * See the {@link Callback type} this factory produces for more.
   *
   * @function
   * @memberof belhop.factory
   *
   * @param {function} error - Function to call on error
   *
   * @return {Callback}
   * @see belhop.factory.callback
   * @see belhop.factory.callbackNoErrors
   */
  belhop.factory.callbackNoSuccess = function(error) {
    return new _Callback(_NO_OP, error);
  };

  /**
   * Evidence factory.
   * See the {@link Evidence type} this factory produces for more.
   *
   * @function
   * @memberof belhop.factory
   *
   * @param {!string} stmt <i>Refer to the factory type</i>
   * @param {!Citation} citation <i>Refer to the factory type</i>
   * @param {?object} [ctxt] <i>Refer to the factory type</i>
   * @param {?string} [summary] <i>Refer to the factory type</i>
   * @param {?object} [meta] <i>Refer to the factory type</i>
   *
   * @return {Evidence}
   */
  belhop.factory.evidence = function(stmt, citation, ctxt, summary, meta) {
    _assert_args(arguments, 2);
    var evidence = {
      bel_statement: stmt,
      citation: citation
    };
    if (_def(typeof ctxt) && _nonnull(ctxt)) {
      evidence.biological_context = ctxt;
    }
    if (_def(typeof summary) && _nonnull(summary)) {
      evidence.summary_text = summary;
    }
    if (_def(typeof meta) && _nonnull(meta)) {
      evidence.metadata = meta;
    }
    return evidence;
  };

  /**
   * Citation factory.
   * See the {@link Citation type} this factory produces for more.
   *
   * @function
   * @memberof belhop.factory
   *
   * @param {!(string|number)} id <i>Refer to the factory type</i>
   * @param {!string} type <i>Refer to the factory type</i>
   * @param {?string} [name] <i>Refer to the factory type</i>
   * @param {?string} [date] <i>Refer to the factory type</i>
   * @param {?string[]} [authors] <i>Refer to the factory type</i>
   * @param {?string} [comment] <i>Refer to the factory type</i>
   *
   * @return {Citation}
   */
  belhop.factory.citation = function(id, type, name, date, authors, comment) {
    _assert_args(arguments, 2);
    var citation = {
      id: id,
      type: type
    };
    if (_def(typeof name) && _nonnull(name)) {
      citation.name = name;
    }
    if (_def(typeof date) && _nonnull(date)) {
      citation.date = date;
    }
    if (_def(typeof authors) && _nonnull(authors)) {
      citation.authors = authors;
    }
    if (_def(typeof comment) && _nonnull(comment)) {
      citation.comment = comment;
    }
    return citation;
  };

  /**
   * @namespace belhop.factory.annotations
   */
  belhop.factory.annotations = {};

  /**
   * Name/Value annotation factory.
   * See the {@link NameValueAnnotation type} this factory produces for more.
   *
   * @function
   * @memberof belhop.factory.annotations
   *
   * @param {!string} name <i>Refer to the factory type</i>
   * @param {!string} value <i>Refer to the factory type</i>
   *
   * @return {NameValueAnnotation}
   */
  belhop.factory.annotations.nameValue = function(name, value) {
    return {
      name: name,
      value: value
    };
  };

  /**
   * Annotation type factory.
   * See the {@link AnnotationType type} this factory produces for more.
   *
   * @function
   * @memberof belhop.factory.annotations
   *
   * @param {!string} name <i>Refer to the factory type</i>
   * @param {!string} prefix <i>Refer to the factory type</i>
   * @param {!string} domain <i>Refer to the factory type</i>
   * @param {!string} uri <i>Refer to the factory type</i>
   *
   * @return {AnnotationType}
   */
  belhop.factory.annotations.type = function(name, prefix, domain, uri) {
    return {
      name: name,
      prefix: prefix,
      domain: domain,
      uri: uri
    };
  };

  /**
   * Annotation value factory.
   * See the {@link AnnotationValue type} this factory produces for more.
   *
   * @function
   * @memberof belhop.factory.annotations
   *
   * @param {!string} identifier <i>Refer to the factory type</i>
   * @param {!string} name <i>Refer to the factory type</i>
   * @param {!string} type <i>Refer to the factory type</i>
   * @param {!string} uri <i>Refer to the factory type</i>
   *
   * @return {AnnotationValue}
   */
  belhop.factory.annotations.value = function(identifier, name, type, uri) {
    return {
      identifier: identifier,
      name: name,
      type: type,
      uri: uri
    };
  };

  /**
   * @namespace belhop.annotations
   */
  belhop.annotations = {};

  /**
   * Get annotation types.
   *
   * @function
   * @memberof belhop.annotations
   *
   * @param {!Callback} cb Zero or more {@link AnnotationType annotation types}
   */
  belhop.annotations.getTypes = function(cb) {
    _assert_args(arguments, 1);
    var path = '/annotations';
    var options = {
      accept: _haljson
    };

    // intercept on success...
    function success(data, status, request) {
      // ... dig into annotations, we only want the content.
      var types = [];
      data.annotations.forEach(function(x) {
        var domain = x.domain;
        var name = x.name;
        var prefix = x.prefix;
        var uri = belhop.__.self(x);
        var type = belhop.factory.annotations.type(name, prefix, domain, uri);
        types.push(type);
      });
      cb.success(types, status, request);
      return;
    }
    var _cb = belhop.factory.callback(success, cb.error);
    apiGET(null, path, _cb, options);
  };

  /**
   * Get an annotation type.
   *
   * @function
   * @memberof belhop.annotations
   *
   * @param {!string} prefix The annotation type's prefix
   * @param {!Callback} cb An {@link AnnotationType annotation type} or
   * <code>null</code> if not found
   */
  belhop.annotations.getType = function(prefix, cb) {
    _assert_args(arguments, 2);
    var path = '/annotations/' + prefix;
    var options = {
      accept: _haljson
    };

    // intercept on success...
    function success(data, status, request) {
      // ... dig into annotations, we only want the content.
      var x = data.annotations[0];
      var domain = x.domain;
      var name = x.name;
      var xprefix = x.prefix;
      var uri = belhop.__.self(x);
      var type = belhop.factory.annotations.type(name, xprefix, domain, uri);
      cb.success(type, status, request);
      return;
    }
    // intercept on error...
    function error(request, errorstr, exception) {
      // not found? null
      if (request.status === 404) {
        cb.success(null, _not_found, request);
        return;
      }
      cb.error(request, errorstr, request);
      return;
    }
    var _cb = belhop.factory.callback(success, error);
    apiGET(null, path, _cb, options);
  };

  /**
   * Get an annotation value.
   *
   * @function
   * @memberof belhop.annotations
   *
   * @param {!string} prefix The annotation type's prefix
   * @param {!string} value The annotation type's value
   * @param {!Callback} cb {@link AnnotationValue} if it
   * exists, <code>null</code> otherwise
   */
  belhop.annotations.getValue = function(prefix, value, cb) {
    _assert_args(arguments, 3);
    var path = '/annotations/' + prefix + '/values/' + value;
    var options = {
      accept: _haljson
    };

    // intercept on success...
    function success(data, status, request) {
      // ... dig into annotation_values, we only want the content.
      var x = data.annotation_values[0];
      var identifier = x.identifier;
      var name = x.name;
      var type = x.type;
      var uri = belhop.__.self(x);
      var av = belhop.factory.annotations.value(identifier, name, type, uri);
      cb.success(av, status, request);
      return;
    }
    // intercept on error...
    function error(request, errorstr, exception) {
      // not found? null
      if (request.status === 404) {
        cb.success(null, _not_found, request);
        return;
      }
      cb.error(request, errorstr, request);
      return;
    }
    var _cb = belhop.factory.callback(success, error);
    apiGET(null, path, _cb, options);
  };

  /**
   * Gets completions for the given input and returns the results.
   *
   * @function
   * @memberof belhop.complete
   *
   * @param {string} input - BEL expression to autocomplete.
   * @param {number} caretPosition - optional caret position
   * @param {Callback} cb Zero or more completions on success
   */
  belhop.complete.getCompletions = function(input, caretPosition, cb) {
    var path = '/expressions/' + input + '/completions';
    var options = {};
    if (_def(typeof caretPosition) && _nonnull(caretPosition)) {
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
   * @memberof belhop.complete.actions
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
   * @memberof belhop.complete.actions.insert
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
   * @memberof belhop.validate
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
   * @memberof belhop.validate
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
   * @memberof belhop.evidence
   *
   * @param {!Evidence} evidence Evidence to create
   * @param {!Callback} cb
   */
  belhop.evidence.create = function(evidence, cb) {
    var path = '/evidence';
    // slot evidence into top-level key-value
    evidence = {evidence: evidence};
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
   * @memberof belhop.evidence
   *
   * @param {?string} id Evidence to get
   * @param {number} [start=0] Page to start from
   * @param {number} [size=<em>all</em>] Number to retrieve
   * @param {Callback} cb
   */
  belhop.evidence.get = function(id, start, size, cb) {
    _assert_args([id, cb], 2);
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
   * @memberof belhop.evidence
   *
   * @param {!Evidence} evidence The evidence to update
   * @param {!Callback} cb
   */
  belhop.evidence.update = function(evidence, cb) {
    _assert_args(arguments, 2);
    // self: what are we updating (PUT href)
    var self = belhop.__.self(evidence);
    var stmt = evidence.bel_statement;
    var citation = evidence.citation;
    var ctxt = evidence.biological_context;
    var summary = evidence.summary_text;
    var meta = evidence.metadata;

    var update = belhop.factory.evidence(stmt, citation, ctxt, summary, meta);
    // slot evidence into top-level key-value
    update = {evidence: update};
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
   * @memberof belhop.evidence
   *
   * @param {!Evidence} evidence The evidence to reset
   * @param {!Callback} cb
   */
  belhop.evidence.reset = function(evidence, cb) {
    _assert_args(arguments, 2);
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
   * @memberof belhop.evidence
   *
   * @param {!Evidence} evidence The evidence to delete
   * @param {!Callback} cb
   */
  belhop.evidence.delete = function(evidence, cb) {
    _assert_args(arguments, 2);
    var self = belhop.__.self(evidence);
    apiDELETE(self, null, cb);
  };

  /**
   * @namespace belhop.evidence.annotation
   * @tutorial working-with-annotations
   */
  belhop.evidence.annotation = {};

  /**
   * Add {@link NameValueAnnotation} to {@link Evidence evidence}.
   *
   * @function
   * @memberof belhop.evidence.annotation
   *
   * @param {!Evidence} evidence The evidence to add to
   * @param {!NameValueAnnotation} nameValueAnnotation The annotation to add
   * @tutorial working-with-annotations
   */
  belhop.evidence.annotation.addNameValue =
    function(evidence, nameValueAnnotation) {
      _assert_args(arguments, 2);
      var ctxt = evidence.biological_context || {};
      var annotation = ctxt[nameValueAnnotation.name] || [];
      annotation.push(nameValueAnnotation.value);
      evidence.biological_context = ctxt;
    };

  /**
   * Add {@link AnnotationType} value to {@link Evidence evidence}.
   *
   * @function
   * @memberof belhop.evidence.annotation
   *
   * @param {!Evidence} evidence The evidence to add to
   * @param {!AnnotationType} annotationType The annotation type to add
   * @param {!string} value The annotation value to add
   * @tutorial working-with-annotations
   */
  belhop.evidence.annotation.addType =
    function(evidence, annotationType, value) {
      // extract annotation name from type
      var name = annotationType.prefix;
      // and defer to name-value function
      belhop.evidence.annotation.addNameValue(evidence, name, value);
    };

  /**
   * Add a {@link AnnotationValue} to {@link Evidence evidence}.
   *
   * @function
   * @memberof belhop.evidence.annotation
   *
   * @param {!Evidence} evidence The evidence to add to
   * @param {!AnnotationValue} annotationValue The annotation to add
   * @tutorial working-with-annotations
   */
  belhop.evidence.annotation.addAnnotation =
    function(evidence, annotationValue) {
      _assert_args(arguments, 2);
      // extract name-value from annotation value
      // FIXME use URI
      var name = annotationValue.prefix;
      var value = annotationValue.identifier;
      // and defer to name-value function
      belhop.evidence.annotation.addNameValue(evidence, name, value);
    };

  /**
   * @namespace belhop.evidence.citation
   */
  belhop.evidence.citation = {};

  /**
   * Replaces the current {@link Citation} on {@link Evidence evidence}.
   *
   * @function
   * @memberof belhop.evidence.citation
   *
   * @param {!Evidence} evidence The evidence to set a citation on
   * @param {!Citation} citation The citation to set
   */
  belhop.evidence.citation.set = function(evidence, citation) {
    _assert_args(arguments, 2);
    evidence.citation = citation;
  };

}.call(this));
