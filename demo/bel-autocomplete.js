$(document).ready(function() {
  
  var lastQuery;

  // Alternate autocompletion display including the "type" of completion, e.g.:
  //   p() increases p() (template) - Protein-Protein Interaction (increase)
  //var COMPLETION_TEMPLATE =
  //  '<p>{{value}} (<em>{{type}}</em>) - <strong>{{label}}</strong></p>';

  // Default autocompletion display w/out the "type" of completion, e.g.:
  //   p() increases p() - Protein-Protein Interaction (increase)
  var COMPLETION_TEMPLATE =
    '<p>{{value}} - <strong>{{label}}</strong></p>';
    
  /**
   * Tokenize the query before sending it to the API; currently only one token
   * is sent: the query itself.
   */
  var tokenizer = function(query) {
    lastQuery = query;
    return [query];
  };

  /**  
   * Filters the API response into typeahead datums for use in the completion
   * template.
   */
  var responseFilter = function(response) {
    var datums = [];
    function insertDatum(element) {
      datum = {
        value: element.completion.value,
        type: element.completion.type,
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
    var str1 = str.substr(0, position + 1);
    var str2 = value;
    var str3 = str.substr(position + value.length);
    return str1 + str2 + str3;
  }
  
  /**
   * Move the cursor to position.
   */
  function moveAction(position) {
    $("#expinput")[0].selectionStart = position;
    $("#expinput")[0].selectionEnd = position;
  }
  
  /**
   * Called when the user selects a completion from our dropdown.
   */
  function selected(event, datum, name) {
    console.log("[USER MADE A SELECTION]");
    console.log("[JQUERY EVENT]");
    console.log(event);
    console.log("[DATUM (SELECTION)]");
    console.log(datum);
    var element = $("#expinput")[0];
    var actions = datum.actions;
    var curInput = lastQuery;
    
    function actOn(action) {
      if (action.delete) {
        var startPos = action.delete.start_position;
        var endPos = action.delete.end_position;
        curInput = deleteAction(curInput, startPos, endPos);
        $("#expinput")[0].value = curInput;
      } else if (action.insert) {
        var value = action.insert.value;
        var position = action.insert.position;
        curInput = insertAction(curInput, value, position);
        $("#expinput")[0].value = curInput;
      } else if (action.move_cursor) {
        var position = action.move_cursor.position;
        moveAction(position);
      }
    }
    actions.forEach(actOn);
    //element.selectionStart = datum.cursorPos;
    //element.selectionEnd = datum.cursorPos;
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
    
});
