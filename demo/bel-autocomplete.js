$(document).ready(function() {

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
        label: element.completion.label
      };
      datums.push(datum);
    } 
    response.forEach(insertDatum);
    return datums;
  };

  var belExpressions = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: 'data/templates.json',
    remote: {
      url: 'http://next.belframework.org/bel/expressions/%QUERY/completions',
      filter: responseFilter
    }
  });

  belExpressions.initialize();

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
});

