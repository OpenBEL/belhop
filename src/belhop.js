/**
 * @file BELHop JavaScript library.
 * @author OpenBEL Committers
 * @license Apache-2.0
*/
(function() {
  'use strict';

  var root = this;
  /* eslint no-underscore-dangle:0 */
  var _defaultURL = 'http://next.belframework.org/api';

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
   * @name belhop.configuration.getURL
   *
   * @param {string} str - Input string to operate on.
   * @param {number} startPos - Starting position of the deletion range.
   * @param {number} endPos - Ending position of the deletion range.
   *
   * @example
   * > belhop.configuration.getURL()
   * 'http://next.belframework.org/api'
   *
   * @return {string} Input string after deletion operation.
   */
  belhop.configuration.getURL = function() {
    if (typeof belhop.currentURL === 'undefined' ||
        belhop.currentURL === null) {
      return belhop.DEFAULT_URL;
    }
    return belhop.currentURL;
  };

  /**
   * Set the API URL.
   *
   * @function
   * @name belhop.configuration.setURL
   *
   * @param {string} str - Input string to operate on.
   * @param {number} startPos - Starting position of the deletion range.
   * @param {number} endPos - Ending position of the deletion range.
   *
   * @example
   * > // reset to the default URL
   * > belhop.configuration.setURL(null);
   */
  belhop.configuration.setURL = function(url) {
    belhop.currentURL = url;
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
   * Gets completions for the given input and returns the results.
   *
   * @function
   * @name belhop.complete.getCompletions
   *
   * @param {string} input - BEL expression to autocomplete.
   * @param {number} caretPosition - optional caret position
   * @param {object} cb - callback with success and error functions
   *
   * @return {Completion} zero or more completions
   */
  belhop.complete.getCompletions = function(input, caretPosition, cb) {
    // ' ' -> %20, etc.
    var path = encodeURI(path);
    path = '/expressions/' + input + '/completions';
    if (typeof caretPosition !== 'undefined' && caretPosition !== null) {
      path += '?caret_position=' + caretPosition;
    }
    var url = belhop.configuration.getURL() + path;
    $.ajax({
      url: url,
      success: cb.success,
      error: cb.error
    });
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
   * Validates some input and returns the results.
   * @namespace belhop.validate
   * @param {string} input - BEL expression to autocomplete.
   *
   * @return {Object}
   */
  belhop.validate = function(input) {
    return {};
  };

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

}.call(this));
