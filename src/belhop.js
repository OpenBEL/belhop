/**
 * @file BELHop JavaScript library.
 * @author OpenBEL Committers
 * @license Apache-2.0
*/
(function() {

  var root = this;
  var _defaultURL = "http://next.belframework.org/api";

  /**
   * The BELHop module.
   * @exports belhop
   * @namespace belhop
   * @author Nick Bargnesi <nbargnesi@selventa.com>
   * @version 0.1.0
   */
  var belhop = function(obj) {
    if (obj instanceof belhop) return obj;
    if (!(this instanceof belhop)) return new belhop(obj);
    belhop.init = true;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = belhop;
  } else {
    root.belhop = belhop;
  }

  /**
   * @name DEFAULT_URL
   * @readonly
   * @type {string}
   * @default
   */
  Object.defineProperty(belhop, 'DEFAULT_URL', {
    get: function() { return _defaultURL; }
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

  /**
   * @namespace belhop.configuration
   */
  belhop.configuration = {};

  /**
   * Get the current configured API URL.
   *
   * @function
   * @name belhop.complete.actions.delete
   *
   * @arg {string} str - Input string to operate on.
   * @arg {number} startPos - Starting position of the deletion range.
   * @arg {number} endPos - Ending position of the deletion range.
   *
   * @example
   * > belhop.configuration.getURL()
   * 'http://next.belframework.org/api'
   *
   * @returns {string} Input string after deletion operation.
   */
  belhop.configuration.getURL = function(completion, input) {
    if (typeof(belhop.currentURL) === 'undefined' ||
        belhop.currentURL === null) {
      return belhop.DEFAULT_URL;
    }
    return belhop.currentURL;
  };

  /**
   * Set the API URL.
   *
   * @function
   * @name belhop.complete.actions.delete
   *
   * @arg {string} str - Input string to operate on.
   * @arg {number} startPos - Starting position of the deletion range.
   * @arg {number} endPos - Ending position of the deletion range.
   *
   * @example
   * > // reset the default URL
   * > belhop.configuration.setURL(null);
   */
  belhop.configuration.setURL = function(url) {
    belhop.currentURL = url;
  };

  /**
   * Applies a completion to the input and returns the result.
   * @namespace belhop.complete

   * @arg {object} completion - BEL API completion object.
   * @arg {string} input - BEL expression to autocomplete.
   *
   * @returns {string} Completed input string.
   */
  belhop.complete = function(completion, input) {
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
    completion.actions.forEach(actOn);
    return input;
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
   * @arg {string} str - Input string to operate on.
   * @arg {number} startPos - Starting position of the deletion range.
   * @arg {number} endPos - Ending position of the deletion range.
   *
   * @example
   * > // delete "JUNK" from input
   * > belhop.complete.actions.delete('fooJUNKbar', 3, 6);
   * 'foobar'
   *
   * @returns {string} Input string after deletion operation.
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
   * @arg {string} str - Input string to operate on.
   * @arg {string} value - String to insert.
   * @arg {number} position - Insertion position.
   *
   * @example
   * > // insert "bar" into input
   * > belhop.complete.actions.insert('foo', 'bar', 3);
   * 'foobar'
   *
   * @returns {string} Input string after insertion operation.
   */
  belhop.complete.actions.insert = function(str, value, position) {
    var str1 = str.substr(0, position);
    var str2 = value;
    var str3 = str.substr(position);
    var rslt = str1 + str2 + str3;
    return rslt;
  };

  /**
   * Validates some input and returns the results.
   * @namespace belhop.validate
   * @arg {string} input - BEL expression to autocomplete.
   *
   * @returns {}
   */
  belhop.validate = function(input) {
    return {};
  };

  /**
   * Insert the string value at position and return the result.
   *
   * @protected
   * @function
   * @name belhop.complete.actions.insert
   *
   * @arg {string} str - Input string to operate on.
   * @arg {string} value - String to insert.
   * @arg {number} position - Insertion position.
   *
   * @returns {}
   */
  belhop.validate.syntax = function(input) {
    return {};
  };

  /**
   * Insert the string value at position and return the result.
   *
   * @protected
   * @function
   * @name belhop.complete.actions.insert
   *
   * @arg {string} str - Input string to operate on.
   * @arg {string} value - String to insert.
   * @arg {number} position - Insertion position.
   *
   * @returns {}
   */
  belhop.validate.semantics = function(input) {
    return {};
  };

}.call(this));
