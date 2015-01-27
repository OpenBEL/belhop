$(document).ready(function() {
  // Alternate autocompletion display including the "type" of completion, e.g.:
  //   p() increases p() (template) - Protein-Protein Interaction (increase)
  //var COMPLETION_TEMPLATE =
  //  '<p>{{value}} (<em>{{type}}</em>) - <strong>{{label}}</strong></p>';

  // Default autocompletion display w/out the "type" of completion, e.g.:
  //   p() increases p() - Protein-Protein Interaction (increase)
  var COMPLETION_TEMPLATE =
    '<p>{{value}}<span class="completion-type">{{displayType}}</p>';

  /**
   * Called when the user selects a completion from our dropdown.
   */
  function selected(event, datum, name) {
    // var element = $('#expinput')[0];
    // var actions = datum.actions;
    // var cursorpos = -1;

    // function moveCur(action) {
    //   if (action.move_cursor) {
    //     cursorpos = action.move_cursor.position;
    //   }
    // }
    // actions.forEach(moveCur);

    // if (cursorpos !== -1) {
    //   element.selectionStart = cursorpos;
    //   element.selectionEnd = cursorpos;
    // }
  };

  /**
   * Transforms the completion into a string for the input control.
   */
  function convertCompletion(completion) {
    console.log('converting completion');
    var value = completion.value;
    console.log('returning value: ' + value);
    return value;
  };

  function doQuery(query, cb) {
    var selectionEnd = $("#expinput")[0].selectionEnd;
    console.log("doQuery: query is " + query + " and cursor is: " + selectionEnd);
    cb([{value: "$19.95", displayType: "Plus Shipping and Handling"}]);
  };

  $('#bel-expressions .typeahead').typeahead(null, {
    name: 'bel-expressions',
    displayKey: convertCompletion,
    source: doQuery,
    templates: {
      empty: [
        '<div class="empty-message">',
        'No completions for this expression.',
        '</div>'
      ].join('\n'),
      suggestion: Handlebars.compile(COMPLETION_TEMPLATE)
    }
  });
  $('#bel-expressions .typeahead').on('typeahead:selected', selected);
  $('#bel-expressions .typeahead').on('typeahead:autocompleted', selected);

  // handle keydown on first input field
  $("#expinput").keydown(function(ev) {
    if (ev.keyCode == 37 || ev.keyCode == 39) {
      // is the dropdown hidden?
      var dropdown = $('#bel-expressions .tt-dropdown-menu');
      if (dropdown.is(':hidden')) {
        // force it open via down arrow keydown event
        var ev = $.Event('keydown', {keyCode: 40});
        var element = $('#expinput');
        element.trigger(ev);
      }
    }
  });

  // handle focus on first input field
  $("#expinput").on('focus', function() {
    console.log('focused');
    // is the dropdown hidden?
    var dropdown = $('#bel-expressions .tt-dropdown-menu');
    if (dropdown.is(':hidden')) {
      // force it open via down arrow keydown event
      var ev = $.Event('keydown', {keyCode: 40});
      var element = $('#expinput');
      element.trigger(ev);
    }
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
