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

  function _Ex(message, args, required) {
    this.name = 'BELHopException';
    var msg = message;
    if (_def(typeof required) && _nonnull(required)) {
      if (required !== args.length) {
        msg += ' (bad arity: ';
        msg += args.length + ' of ' + required + ' given)';
      }
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
    if (!(success instanceof Function)) {
      msg = 'success ' + msg + '(' + typeof success + ')';
      throw new Error(msg);
    }
    if (!(error instanceof Function)) {
      msg = 'error ' + msg + ' (' + typeof success + ')';
      throw new Error(msg);
    }
    this.success = success;
    this.error = error;
  }

  function _assert_num(args, index) {
    var msg;
    var arg;

    if (index >= args.length) {
      msg = _badfcall;
      msg += ': argument ' + (index + 1) + ' is required';
      throw new _Ex(msg, args);
    }
    arg = args[index];
    if (typeof arg !== 'number') {
      msg = _badfcall;
      msg += ': argument ' + (index + 1) + ' is not a number';
      throw new _Ex(msg, args);
    }
  }

  function _assert_type(args, index, type) {
    var msg;
    var arg;
    var argtype;

    if (index >= args.length) {
      msg = _badfcall;
      msg += ': argument ' + (index + 1) + ' is required';
      throw new _Ex(msg, args);
    }
    arg = args[index];
    if (!(arg instanceof type)) {
      argtype = typeof arg;
      msg = _badfcall;
      msg += ': argument ' + (index + 1) + ' is not a valid type';
      msg += ' (' + argtype + ') for this function';
      throw new _Ex(msg, args);
    }
  }

  function _assert_args(args, required) {
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
        } else if (!(x.success instanceof Function)) {
          msg = _badcb;
          msg += ': invalid success function';
          msg += ' (' + typeof x.success + ')';
          throw new _Ex(msg, args, required);
        } else if (_undef(typeof x.error)) {
          msg = _badcb;
          msg += ': undefined error function';
          throw new _Ex(msg, args, required);
        } else if (!(x.error instanceof Function)) {
          msg = _badcb;
          msg += ': invalid error function';
          msg += ' (' + typeof x.error + ')';
          throw new _Ex(msg, args, required);
        }
      } else if (_def(x.__bhValidate)) {
        // validate internal type
        var rslt = x.__bhValidate(x);
        if (!(rslt.valid)) {
          throw new _Ex(rslt.msg, args, required);
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
    if (!(_hasself(obj))) {
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
  * @memberOf belhop
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
   * @memberOf belhop
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
   * @memberOf belhop
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
   * @memberOf belhop
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
   * @memberOf belhop
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
   * @memberOf belhop
   * @typedef {Evidence} Evidence
   * @property {?string} id The evidence identifier (if previously created)
   * @property {string} bel_statement Represents the biological knowledge
   * @property {belhop.Citation} citation Source of the biological knowledge
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
    * @memberOf belhop
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

  /**
   * <h2>Warning</h2>
   * The definition of this class can and <strong>will likely change</strong>
   * over time. Instances of this class <strong>should be treated as</strong>
   * an <em>opaque type</em>.
   *
   * @class
   * @name FilterOptions
   * @memberOf belhop.__
   * @summary Internal representation of a BEL API filter.
   * @protected
   *
   * @param {!string} category No further documentation.
   * @param {!string} name No further documentation.
   * @param {!string} value No further documentation.
   *
   * @property {string} category No further documentation.
   * @property {string} name No further documentation.
   * @property {string} value No further documentation.
   */
  function FilterOptions(category, name, value) {
    this.category = category;  // non-null
    this.name = name;  // non-null
    this.value = value;  // non-null
  }

  /**
   * Internal validation of filter options.
   *
   * @protected
   * @name __bhValidate
   * @memberOf belhop.__.FilterOptions
   * @instance
   * @method
   *
   * @example
   * // not valid, missing value
   * > (new FilterOptions('cat', 'name', null).__bhValidate()).valid
   * false
   */
  FilterOptions.prototype.__bhValidate = function() {
    var msgs = [];
    var valid = true;
    try {
      if (_null(this.category)) {
        valid = false;
        msgs.push('null category');
      }
      if (_null(this.name)) {
        valid = false;
        msgs.push('null name');
      }
      if (_null(this.value)) {
        valid = false;
        msgs.push('null value');
      }
      return {valid: valid, msg: msgs.join('|')};
    } catch (e) {
      return {valid: false, msg: e.toString()};
    }
  };

  /**
   * Translates the filter options to JSON.
   *
   * @name toJSON
   * @memberOf belhop.__.FilterOptions
   * @instance
   * @method
   *
   * @example
   * > new FilterOptions('cat', 'name', 'val').toJSON()
   * {"category":"cat","name":"name","value":"val"}
   */
  FilterOptions.prototype.toJSON = function() {
    var json = {
      category: this.category,
      name: this.name,
      value: this.value
    };
    return json;
  };

  /**
   * Translates the filter options to a query string.
   *
   * @name toQueryString
   * @memberOf belhop.__.FilterOptions
   * @instance
   * @method
   *
   * @example
   * > new FilterOptions('cat', 'name', 'val').toQueryString()
   * 'filter={"category":"cat","name":"name","value":"val"}'
   */
  FilterOptions.prototype.toQueryString = function() {
    var qname = 'filter';
    var qvalue = JSON.stringify(this);
    var qparam = qname + '=' + qvalue;
    return qparam;
  };

  /**
   * <h2>Warning</h2>
   * The definition of this class can and <strong>will likely change</strong>
   * over time. Instances of this class <strong>should be treated as</strong>
   * an <em>opaque type</em>.
   *
   * @class
   * @name DefaultFilterOptions
   * @memberOf belhop.__
   * @augments belhop.__.FilterOptions
   * @summary Internal representation of a default BEL API filter.
   * @protected
   *
   * @param {!string} value Search term
   *
   * @property {string} value Search term
   */
  function DefaultFilterOptions(value) {
    FilterOptions.call(this);
    this.category = 'fts';
    this.name = 'search';
    this.value = value;
  }
  DefaultFilterOptions.prototype = Object.create(FilterOptions.prototype);
  DefaultFilterOptions.prototype.constructor = FilterOptions;

  /**
   * <h2>Warning</h2>
   * The definition of this class can and <strong>will likely change</strong>
   * over time. Instances of this class <strong>should be treated as</strong>
   * an <em>opaque type</em>.
   *
   * @class
   * @name SearchOptions
   * @memberOf belhop.__
   * @summary Internal representation of BEL API search options.
   * @protected
   *
   * @param {!string} start Index to start from (for paging)
   * @param {!string} size Size limit (for paging)
   * @param {!FilterOptions} filterOptions Filter options
   *
   * @property {string} start Index to start from (for paging)
   * @property {string} size Size limit (for paging)
   * @property {FilterOptions} filterOptions Filter options
   */
  function SearchOptions(start, size, filterOptions) {
    this.start = start;  // non-null
    this.size = size;  // non-null
    this.filterOptions = filterOptions;  // nullable
  }
  /**
   * Internal validation of search options.
   *
   * @protected
   * @name __bhValidate
   * @memberOf belhop.__.SearchOptions
   * @instance
   * @method
   *
   * @example
   * // not valid, missing value
   * > (new SearchOptions(null, 'name', null).__bhValidate()).valid
   * false
   */
  SearchOptions.prototype.__bhValidate = function() {
    var msgs = [];
    var valid = true;
    try {
      if (_null(this.start)) {
        valid = false;
        msgs.push('null start');
      }
      if (_null(this.size)) {
        valid = false;
        msgs.push('null size');
      }
      return {valid: valid, msg: msgs.join('|')};
    } catch (e) {
      return {valid: false, msg: e.toString()};
    }
  };

  /**
   * Translates the search options to a query string.
   *
   * @name toQueryString
   * @memberOf belhop.__.SearchOptions
   * @instance
   * @method
   *
   * @example
   * // start from item 20, get 10 results, no filter
   * > new SearchOptions('20', '10', null).toQueryString();
   * 'start=20&size=10'
   */
  SearchOptions.prototype.toQueryString = function() {
    var queryParams = [];
    var qpstart = ('start=' + this.start);
    queryParams.push(qpstart);
    var qpsize = ('size=' + this.size);
    queryParams.push(qpsize);
    if (_nonnull(this.filterOptions)) {
      var qpfilter = this.filterOptions.toQueryString();
      queryParams.push(qpfilter);
    }
    var queryString = queryParams.join('&');
    return queryString;
  };

  /**
   * <h2>Warning</h2>
   * The definition of this class can and <strong>will likely change</strong>
   * over time. Instances of this class <strong>should be treated as</strong>
   * an <em>opaque type</em>.
   *
   * @class
   * @name DefaultSearchOptions
   * @memberOf belhop.__
   * @augments belhop.__.SearchOptions
   * @summary Internal representation of default BEL API search options.
   * @protected
   *
   * @param {!string} value Search term
   *
   * @property {string} value Search term
   */
  function DefaultSearchOptions(value) {
    SearchOptions.call(this);
    this.start = '0';
    this.size = '10';
    this.filterOptions = new DefaultFilterOptions(value);
  }
  DefaultSearchOptions.prototype = Object.create(SearchOptions.prototype);
  DefaultSearchOptions.prototype.constructor = SearchOptions;

  /**
   * This namespace is used internally by the library. Accessing this API
   * directly is discouraged.
   *
   * @protected
   * @namespace belhop.__
   *
   * @summary Internal namespace.
   */
  belhop.__ = {
    FilterOptions: FilterOptions,
    DefaultFilterOptions: DefaultFilterOptions,
    SearchOptions: SearchOptions,
    DefaultSearchOptions: DefaultSearchOptions
  };

  belhop.__.self = function(obj) {
    var apiurl = belhop.configuration.getAPIURL();
    return _self(apiurl, obj);
  };

  /**
   * This namespace contains APIs targeting the configuration of the library.
   * @namespace belhop.configuration
   *
   * @summary Configure BELHop.
   * @tutorial configuration-test
   */
  belhop.configuration = {};

  /**
   * Get the current API URL.
   *
   * @memberOf belhop.configuration
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
   * @memberOf belhop.configuration
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
   * @memberOf belhop.configuration
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
   * @memberOf belhop.configuration
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
   * @memberOf belhop.configuration
   *
   * @param {Callback} cb
   * @tutorial configuration-test
   */
  belhop.configuration.test = function(cb) {
    apiHEAD('', cb);
  };

  /**
   * This namespace exposes BEL autocompletion capabilities.
   * @namespace belhop.complete
   *
   * @summary Generate and use BEL autocompletions.
   */
  belhop.complete = {};

  /**
   * Applies a completion to the input and returns the result.
   *
   * @memberOf belhop.complete
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
   * This namespace contains functions to create BEL and BELHop types.
   * @namespace belhop.factory
   *
   * @summary Create BEL and BELHop types in the factory.
   */
  belhop.factory = {};

  /**
   * Create a callback.
   * See the {@link belhop.Callback type} this factory produces for more.
   *
   * @memberOf belhop.factory
   *
   * @param {function} success - Function to call on success
   * @param {function} error - Function to call on error
   *
   * @return {belhop.Callback} the BELHop type produced by this factory
   * @see belhop.factory.callbackNoErrors
   * @see belhop.factory.callbackNoSuccess
   */
  belhop.factory.callback = function(success, error) {
    return new _Callback(success, error);
  };

  /**
   * Create a callback that treats errors as a no-op.
   * See the {@link belhop.Callback type} this factory produces for more.
   *
   * @memberOf belhop.factory
   *
   * @param {function} success - Function to call on success
   *
   * @return {belhop.Callback} the BELHop type produced by this factory
   * @see belhop.factory.callback
   * @see belhop.factory.callbackNoSuccess
   */
  belhop.factory.callbackNoErrors = function(success) {
    return new _Callback(success, _NO_OP);
  };

  /**
   * Create a callback that treats success as a no-op.
   * See the {@link belhop.Callback type} this factory produces for more.
   *
   * @memberOf belhop.factory
   *
   * @param {function} error - Function to call on error
   *
   * @return {belhop.Callback} the BELHop type produced by this factory
   * @see belhop.factory.callback
   * @see belhop.factory.callbackNoErrors
   */
  belhop.factory.callbackNoSuccess = function(error) {
    return new _Callback(_NO_OP, error);
  };

  /**
   * Evidence factory.
   * See the {@link belhop.Evidence type} this factory produces for more.
   *
   * @memberOf belhop.factory
   *
   * @param {!string} stmt <i>Refer to the factory type</i>
   * @param {!belhop.Citation} citation <i>Refer to the factory type</i>
   * @param {?object} [ctxt] <i>Refer to the factory type</i>
   * @param {?string} [summary] <i>Refer to the factory type</i>
   * @param {?object} [meta] <i>Refer to the factory type</i>
   *
   * @return {belhop.Evidence} the BELHop type produced by this factory
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
   * See the {@link belhop.Citation type} this factory produces for more.
   *
   * @memberOf belhop.factory
   *
   * @param {!(string|number)} id <i>Refer to the factory type</i>
   * @param {!string} type <i>Refer to the factory type</i>
   * @param {?string} [name] <i>Refer to the factory type</i>
   * @param {?string} [date] <i>Refer to the factory type</i>
   * @param {?string[]} [authors] <i>Refer to the factory type</i>
   * @param {?string} [comment] <i>Refer to the factory type</i>
   *
   * @return {belhop.Citation} the BELHop type produced by this factory
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
   * See the {@link belhop.NameValueAnnotation type} this factory produces for
   * more.
   *
   * @memberOf belhop.factory.annotations
   *
   * @param {!string} name <i>Refer to the factory type</i>
   * @param {!string} value <i>Refer to the factory type</i>
   *
   * @return {belhop.NameValueAnnotation} the BELHop type produced by this
   * factory
   */
  belhop.factory.annotations.nameValue = function(name, value) {
    return {
      name: name,
      value: value
    };
  };

  /**
   * Annotation type factory.
   * See the {@link belhop.AnnotationType type} this factory produces for more.
   *
   * @memberOf belhop.factory.annotations
   *
   * @param {!string} name <i>Refer to the factory type</i>
   * @param {!string} prefix <i>Refer to the factory type</i>
   * @param {!string} domain <i>Refer to the factory type</i>
   * @param {!string} uri <i>Refer to the factory type</i>
   *
   * @return {belhop.AnnotationType} the BELHop type produced by this factory
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
   * See the {@link belhop.AnnotationValue type} this factory produces for more.
   *
   * @memberOf belhop.factory.annotations
   *
   * @param {!string} identifier <i>Refer to the factory type</i>
   * @param {!string} name <i>Refer to the factory type</i>
   * @param {!string} type <i>Refer to the factory type</i>
   * @param {!string} uri <i>Refer to the factory type</i>
   *
   * @return {belhop.AnnotationValue} the BELHop type produced by this factory
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
   * @protected
   * @namespace belhop.factory.options
   */
  belhop.factory.options = {};

  /**
   * @namespace belhop.factory.options.filter
   */
  belhop.factory.options.filter = {};

  /**
   * Custom filter options factory.
   * See the {@link belhop.__.FilterOptions type} this factory produces for
   * more.
   *
   * @memberOf belhop.factory.options.filter
   * @todo Improve parameter documentation.
   *
   * @param {!string} category Category to filter on
   * @param {!string} name Name to filter on
   * @param {!string} value Value to filter on
   *
   * @return {belhop.__.FilterOptions} the BELHop type produced by this factory
   */
  belhop.factory.options.filter.custom = function(category, name, value) {
    _assert_args(arguments, 3);
    var filter = new FilterOptions(category, name, value);
    return filter;
  };

  /**
   * Default filter options factory.
   * See the {@link belhop.__.DefaultFilterOptions type} this factory produces
   * for more.
   *
   * @memberOf belhop.factory.options.filter
   * @param {!string} value Search term
   *
   * @return {belhop.__.DefaultFilterOptions} the BELHop type produced by this
   * factory
   */
  belhop.factory.options.filter.default = function(value) {
    _assert_args(arguments, 1);
    var filter = new DefaultFilterOptions(value);
    return filter;
  };

  /**
   * @namespace belhop.factory.options.search
   */
  belhop.factory.options.search = {};

  /**
   * Custom search options factory.
   * See the {@link belhop.__.SearchOptions type} this factory produces for
   * more.
   *
   * @memberOf belhop.factory.options.search
   *
   * @param {!belhop.__.FilterOptions} Filter options
   * @param {number} [start=0] Page to start from
   * @param {number} [size=10] Maximum search results
   *
   * @return {belhop.__.SearchOptions} the BELHop type produced by this factory
   * @example
   * // search for 'foo'
   * var filterOpts = belhop.factory.options.filter.default('foo');
   * // paging search results 10 at a time, get the second page
   * var searchOpts = belhop.factory.options.search.custom(filterOpts, 10, 10);
   */
  belhop.factory.options.search.custom = function(filterOptions, start, size) {
    // only filterOptions is required
    _assert_args(arguments, 1);
    // assert first arg are filter options
    _assert_type(arguments, 0, FilterOptions);
    var _start;
    var _size;

    // accept start or default it
    if (_def(typeof start) && _nonnull(start)) {
      _assert_num(arguments, 1);
      _start = start;
    } else {
      // default to 0 as per function docs
      _start = 0;
    }

    // accept size or default it
    if (_def(typeof size) & _nonnull(size)) {
      _assert_num(arguments, 2);
      _size = size;
    } else {
      // default to 10 as per function docs
      _size = 10;
    }

    var searchOpts = new SearchOptions(_start, _size, filterOptions);
    return searchOpts;
  };

  /**
   * Default search options factory.
   * See the {@link belhop.__.DefaultSearchOptions type} this factory produces
   * for more.
   *
   * @memberOf belhop.factory.options.search
   *
   * @param {!string} value Search term
   *
   * @return {belhop.__.DefaultSearchOptions} the BELHop type produced by this
   * factory
   * @example
   * // search for 'foo' using defaults
   * var opts = belhop.factory.options.search.default('foo');
   */
  belhop.factory.options.search.default = function(value) {
    _assert_args(arguments, 1);
    var searchOpts = new DefaultSearchOptions(value);
    return searchOpts;
  };

  /**
   * Default evidence search options factory.
   * See the {@link belhop.__.SearchOptions type} this factory
   * produces for more.
   *
   * @memberOf belhop.factory.options.search
   *
   * @param {!belhop.__.FilterOptions} Filter options
   * @param {number} [start=0] Page to start from
   * @param {number} [size=100] Maximum search results
   *
   * @return {belhop.__.SearchOptions} the BELHop type produced by this factory
   */
  belhop.factory.options.search.evidence =
      function(filterOptions, start, size) {
    // only filterOptions is required
    _assert_args(arguments, 1);
    var _start;
    var _size;

    // accept start or default it
    if (_def(typeof start) && _nonnull(start)) {
      _assert_num(arguments, 1);
      _start = start;
    } else {
      // default to 0 as per function docs
      _start = 0;
    }

    // accept size or default it
    if (_def(typeof size) & _nonnull(size)) {
      _assert_num(arguments, 2);
      _size = size;
    } else {
      // default to 100 as per function docs
      _size = 100;
    }

    var searchOpts = new SearchOptions(_start, _size, filterOptions);
    return searchOpts;
  };

  /**
   * This namespace contains APIs for interacting with annotations.
   * @namespace belhop.annotations
   *
   * @summary Interact with annotations.
   */
  belhop.annotations = {};

  /**
   * Get annotation types.
   *
   * @memberOf belhop.annotations
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
   * @memberOf belhop.annotations
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
    function error(request, errorstr) {
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
   * @memberOf belhop.annotations
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
    function error(request, errorstr) {
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
   * Search annotation values of a specific type.
   *
   * @memberOf belhop.annotations
   *
   * @param {!string} prefix The annotation type's prefix
   * @param {!string} searchTerm Search term
   * @param {!Callback} cb Zero or more {@link AnnotationValue}
   */
  belhop.annotations.searchByType = function(type, searchTerm, cb) {
    // type can be an annotation type or string
    _assert_args(arguments, 3);
    var searchOpts = new DefaultSearchOptions(searchTerm);
    // XXX assuming type is string for now
    var path = '/annotations/' + type + '/values';
    var options = {};
    options.queryParams = searchOpts.toQueryString();

    // intercept on success...
    function success(data, status, request) {
      var factory = belhop.factory.annotations.value;
      // ... dig into annotation_values, we only want the content.
      var values = [];
      data.annotation_values.forEach(function(x) {
        var avtype = x.type;
        var identifier = x.identifier;
        var name = x.name;
        var uri = belhop.__.self(x);
        var value = factory(identifier, name, avtype, uri);
        values.push(value);
      });
      cb.success(values, status, request);
      return;
    }
    // intercept on error...
    function error(request, errorstr) {
      // not found? []
      if (request.status === 404) {
        cb.success([], _not_found, request);
        return;
      }
      cb.error(request, errorstr, request);
      return;
    }
    var _cb = belhop.factory.callback(success, error);
    apiGET(null, path, _cb, options);
  };

  /**
   * Search across all annotation values.
   *
   * @memberOf belhop.annotations
   *
   * @param {!string} searchTerm Search term
   * @param {!Callback} cb Zero or more {@link AnnotationValue}
   */
  belhop.annotations.search = function(searchTerm, cb) {
    _assert_args(arguments, 2);
    var searchOpts = new DefaultSearchOptions(searchTerm);
    var path = '/annotations/values';
    var options = {};
    options.queryParams = searchOpts.toQueryString();

    // intercept on success...
    function success(data, status, request) {
      var factory = belhop.factory.annotations.value;
      // ... dig into annotation_values, we only want the content.
      var values = [];
      data.annotation_values.forEach(function(x) {
        var type = x.type;
        var identifier = x.identifier;
        var name = x.name;
        var uri = belhop.__.self(x);
        var value = factory(identifier, name, type, uri);
        values.push(value);
      });
      cb.success(values, status, request);
      return;
    }
    // intercept on error...
    function error(request, errorstr) {
      // not found? []
      if (request.status === 404) {
        cb.success([], _not_found, request);
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
   * @memberOf belhop.complete
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

  belhop.complete.actions = {};

  /**
   * Delete the characters from startPos to endPos inclusively and return the
   * result.
   *
   * @protected
   * @memberOf belhop.complete.actions
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
   * @memberOf belhop.complete.actions.insert
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
   * This namespace exposes BEL validation capabilities.
   * @namespace belhop.validate
   *
   * @todo implement
   *
   * @summary Validate BEL expressions.
   */
  belhop.validate = {};

  /**
   * Insert the string value at position and return the result.
   *
   * @memberOf belhop.validate
   * @todo implement
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
   * @memberOf belhop.validate
   * @todo implement
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
   * This namespace contains APIs for interacting with evidence.
   * @namespace belhop.evidence
   *
   * @summary Interact with evidence.
   * @see {Evidence} The type used by this namespace.
   */
  belhop.evidence = {};

  /**
   * Create new evidence.
   *
   * @memberOf belhop.evidence
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
   * @memberOf belhop.evidence
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
   * @memberOf belhop.evidence
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
   * @memberOf belhop.evidence
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
   * @memberOf belhop.evidence
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
   * @memberOf belhop.evidence.annotation
   *
   * @param {!Evidence} evidence The evidence to add to
   * @param {!NameValueAnnotation} nameValueAnnotation The annotation to add
   * @tutorial working-with-annotations
   */
  belhop.evidence.annotation.addNameValue =
    function(evidence, nameValueAnnotation) {
      _assert_args(arguments, 2);
      var ctxt = evidence.biological_context || [];
      var annotation = {
        name: nameValueAnnotation.name,
        value: nameValueAnnotation.value
      };
      ctxt.push(annotation);
      evidence.biological_context = ctxt;
    };

  /**
   * Add {@link AnnotationType} value to {@link Evidence evidence}.
   *
   * @memberOf belhop.evidence.annotation
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
      var annotation = belhop.factory.annotations.nameValue(name, value);
      // and defer to name-value function
      belhop.evidence.annotation.addNameValue(evidence, annotation);
    };

  /**
   * Add a {@link AnnotationValue} to {@link Evidence evidence}.
   *
   * @memberOf belhop.evidence.annotation
   *
   * @param {!Evidence} evidence The evidence to add to
   * @param {!AnnotationValue} annotationValue The annotation to add
   * @tutorial working-with-annotations
   */
  belhop.evidence.annotation.addAnnotation =
    function(evidence, annotationValue) {
      _assert_args(arguments, 2);
      // extract name-value from annotation value
      var ctxt = evidence.biological_context || [];
      ctxt.push(annotationValue.uri);
      evidence.biological_context = ctxt;
    };

  /**
   * @namespace belhop.evidence.citation
   */
  belhop.evidence.citation = {};

  /**
   * Replaces the current {@link Citation} on {@link Evidence evidence}.
   *
   * @memberOf belhop.evidence.citation
   *
   * @param {!Evidence} evidence The evidence to set a citation on
   * @param {!Citation} citation The citation to set
   */
  belhop.evidence.citation.set = function(evidence, citation) {
    _assert_args(arguments, 2);
    evidence.citation = citation;
  };

}.call(this));
