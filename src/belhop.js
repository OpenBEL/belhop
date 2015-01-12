window.BH = (function() {
  function BELHop() {

  }

  BELHop.defaultURL = "http://next.belframework.org/bel";
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

    complete: {
      statement: function() {
        return {}
      },
      term: function() {
        return {}
      }
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
