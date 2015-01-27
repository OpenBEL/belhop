$(document).ready(function() {
  var datums = [];

  // Each autocompletion suggestion renedered as the following...
  var COMPLETION_TEMPLATE =
    '<p>{{value}}<span class="completion-type">{{displayType}}</p>';

  /**
   * Called when the user selects a completion from our dropdown.
   */
  function selected(event, datum, name) {
    var element = $('#expinput')[0];
    var actions = datum.actions;
    var cursorpos = -1;

    function moveCur(action) {
      if (action.move_cursor) {
        cursorpos = action.move_cursor.position;
      }
    }
    actions.forEach(moveCur);

    if (cursorpos !== -1) {
      element.selectionStart = cursorpos;
      element.selectionEnd = cursorpos;
    }
  };

  /**
   * Convert BEL API representations of completions into datums usable by
   * typeahead.
   */
  function convertCompletions(input, completions) {
    datums = [];
    /* convert completion to datum */
    function addDatum(completion) {
      // looks odd but "completion" is a key in the actual completion object
      var completionType = completion.completion.type;
      var displayType = displayCompletionType(completionType);
      var value = belhop.complete.apply(completion, input);
      var datum = {
        value: value,
        displayType: displayType,
        actions: completion.completion.actions
      };
      datums.push(datum);
    }
    /* add a datum for each completion */
    completions.forEach(addDatum);
    return datums;
  }

  /**
   * Get completions via belhop and supply datums to typeahead callback "cb".
   */
  function doQuery(query, cb) {
    /* invoke callback without suggestions on error */
    var onErr = function() { cb([]) };

    /* invoke callback with converted completions on success */
    var onSucc = function(completions) {
      var datums = convertCompletions(query, completions);
      cb(datums);
    };

    var _cb = {
      error: onErr,
      success: onSucc
    };

    // treat end of input element selection as API caret position
    var selectionEnd = $("#expinput")[0].selectionEnd;
    console.log('at position ' + selectionEnd + ' querying "' + query +'"');
    belhop.complete.getCompletions(query, selectionEnd, _cb);
  };

  $('#bel-expressions .typeahead').typeahead(null, {
    name: 'bel-expressions',
    displayKey: 'value',
    source: doQuery,
    templates: {
      empty: null,
      suggestion: Handlebars.compile(COMPLETION_TEMPLATE)
    }
  });
  $('#bel-expressions .typeahead').on('typeahead:selected', selected);
  $('#bel-expressions .typeahead').on('typeahead:autocompleted', selected);

  // handle keydown on first input field
  $("#expinput").keydown(function(ev) {
    if (ev.keyCode !== 37 && ev.keyCode !== 39) {
      return;
    }
    var ta = $("#expinput").data().ttTypeahead;
    ta.dropdown.close();
  });

  // handle keydown on first input field
  $("#expinput").keyup(function(ev) {
    if (ev.keyCode !== 37 && ev.keyCode !== 39) {
      return;
    }
    var ta = $("#expinput").data().ttTypeahead;
    var curval = ta.getVal();
    ta.dropdown.update(curval);
    ta.dropdown.open();
  });

  var haunt = ghostwriter.haunt({
    loop: false,
    input: '#expinput',
    interval: 500,
    manuscript: [
      ghostwriter.selectAll,
      ghostwriter.backspace,
      'proteinAbu',
      ghostwriter.down,
      ghostwriter.enter,
      'HGNC:',
      ghostwriter.down,
      ghostwriter.enter,
      ', pm',
      ghostwriter.down,
      ghostwriter.enter,
      'P, S, 385'
    ]
  });

  var demo = function() {
    haunt.stop();
    haunt.start();
  };
  $('#demo').on('click', demo);

  /**
   * Converts the type of a completion to a string suitable for display to the
   * user.
   */
  var displayCompletionType = function(type) {
    switch (type) {
      case 'function':
        return 'BEL Language Function';
      case 'namespace_prefix':
        return 'BEL Namespace';
      case 'namespace_value':
        return 'BEL Namespace Entity';
      default:
        return 'Unknown type (' + type + ')';
    }
  }

});
