/**
 * @file BELHop JavaScript library.
 * @author OpenBEL Committers
 * @license Apache-2.0
*/
(function() {

  var root = this;

  /**
   * The BELHop module.
   * @exports belhop
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
   * @arg {object} completion - BEL API completion object.
   * @arg {string} input - BEL expression to autocomplete.
   */
  belhop.complete = function(completion, input) {

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