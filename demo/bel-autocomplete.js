$(document).ready(function() {

  var lastQuery;

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

  function doQuery(query, cb) {
    cb([{value: "$19.95", displayType: "Plus Shipping and Handling"}]);
  };

  $('#bel-expressions .typeahead').typeahead(null, {
    name: 'bel-expressions',
    displayKey: 'value',
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
