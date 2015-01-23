/**
 * @file BELHop JavaScript library.
 * @author OpenBEL Committers
 * @license Apache-2.0
*/
(function() {

  var root = this;
  const defaultURL = "http://next.belframework.org/api";

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
    get: function() { return defaultURL; }
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
   * Executes a completion on some input and returns the results.
   * @namespace belhop.complete
   * @arg {object} completion - BEL API completion object.
   * @arg {string} input - BEL expression to autocomplete.
   */
  belhop.complete = function(completion, input) {

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
   * // delete "JUNK" from input
   * belhop.complete.actions.delete('fooJUNKbar', 3, 6);
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
   * @returns {string} Input string after insertion operation.
   */
  belhop.complete.actions.insert = function(str, value, position) {

  };

}.call(this));

/*
 * Represents a book.
 * @constructor
 * @arg {string} title - The title of the book.
 * @arg {string} author - The author of the book.
 *
function Book(title, author) {
}

window.BH = (function() {
  function BELHop() {

  }

  BELHop.defaultURL = "http://next.belframework.org/api";
  BELHop.url = BELHop.defaultURL;

  var belhop = {
    defaultURL: BELHop.defaultURL,

    configuration: {
      getURL: function() {
        return BELHop.url;
      },
      setURL: function(url) {
        BELHop.url = url;
      }
    },

    /
     * Executes a completion on some input and returns the results.
     * @arg {object} completion - BEL API completion object.
     * @arg {string} input - BEL expression to autocomplete.
     *
    complete: function(completion, input) {
    },

    validate: {
      syntax: function() {
        return {}
      },
      semantics: function() {
        return {}
      }
    }
  };
  return belhop;
}());
*/