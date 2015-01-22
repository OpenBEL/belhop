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
   * Tokenize the query before sending it to the API; currently only one token
   * is sent: the query itself.
   */
  var tokenizer = function(query) {
    lastQuery = query;
    return [query];
  };

  /**
   * Manipulate the URL prior to generating an autocompletion.
   */
  var replacer = function(url, query) {
    var ret = url.replace('%QUERY', query);
    var end = $('#expinput')[0].selectionEnd;
    ret += ('?caret_position=' + end);
    return ret;
  };

  /**
   * Filters the API response into typeahead datums for use in the completion
   * template.
   */
  var responseFilter = function(response) {
    var datums = [];
    function insertDatum(element) {
      datum = {
        value: applyActions(element.completion.actions, lastQuery),
        displayType: displayCompletionType(element.completion.type),
        label: element.completion.label,
        actions: element.completion.actions
      };
      datums.push(datum);
    }
    response.forEach(insertDatum);
    return datums;
  };

  var belExpressions = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: tokenizer,
    prefetch: 'data/templates.json',
    remote: {
      url: 'http://next.belframework.org/api/expressions/%QUERY/completions',
      replace: replacer,
      filter: responseFilter
    }
  });

  belExpressions.initialize();

  /**
   * Delete the characters from startPos to endPos, inclusively, and return the
   * result.
   */
  function deleteAction(str, startPos, endPos) {
    var str1 = str.substr(0, startPos);
    var str2 = str.substr(endPos + 1);
    var ret = str1 + str2;
    return ret;
  }

  /**
   * Insert the string value at a position in str.
   */
  function insertAction(str, value, position) {
    var str1 = str.substr(0, position);
    var str2 = value;
    var str3 = str.substr(position);
    var rslt = str1 + str2 + str3;
    return rslt;
  }

  /**
   * Apply autocomplete actions to some input and return the result.
   */
  function applyActions(actions, input) {

    /* applies a single action */
    function actOn(action) {
      if (action.delete) {
        var startPos = action.delete.start_position;
        var endPos = action.delete.end_position;
        input = deleteAction(input, startPos, endPos);
      } else if (action.insert) {
        var value = action.insert.value;
        var position = action.insert.position;
        input = insertAction(input, value, position);
      }
    }

    /* apply each action, mutating input */
    actions.forEach(actOn);
    return input;
  }

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

  $('#bel-expressions .typeahead').typeahead(null, {
    name: 'bel-expressions',
    displayKey: 'value',
    source: belExpressions.ttAdapter(),
    templates: {
      empty: [
        '<div class="empty-message">',
        'No completions for this expression.',
        '</div>'
      ].join('\n'),
      suggestion: Handlebars.compile(COMPLETION_TEMPLATE)
    }
  });
  $('#bel-expressions .typeahead').on("typeahead:selected", selected);
  $('#bel-expressions .typeahead').on("typeahead:autocompleted", selected);

  /*
  var haunt = ghostwriter.haunt({
    loop: true,
    input: '#expinput',
    interval: 150,
    manuscript: [
      ghostwriter.noop,
      'proteinAbun',
      ghostwriter.backspace.repeat(10),
      'm',
      ghostwriter.backspace.repeat(1),
      '(HGNC:AKT1, p',
      ghostwriter.selectAll,
      ghostwriter.backspace
    ]
  });
  haunt.start();
  */

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
