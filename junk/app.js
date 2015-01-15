$(document).ready(function() {
  var repos;

  repos = new Bloodhound({
    datumTokenizer: function(d) { return []; },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: 'http://next.belframework.org/api/expressions/%QUERY/completions'
  });

  repos.initialize();

  $('.typeahead').typeahead(null, {
    name: 'repos',
    displayKey: function(obj) {
      return obj.completion.value;
    },
    highlight: true,
    source: repos.ttAdapter(),
    input_state: "",
    templates: {
      suggestion: function(obj) {
        obj.completion.name = obj.completion.label;
        return '<p>'+obj.completion.label+'</p>';
      }
    }
  });

  $('.typeahead').on('typeahead:selected typeahead:autocompleted', function(jqEvent, suggestion, dataset) {
    var source = $('.typeahead').typeahead.input_state;

    console.log(suggestion.completion);

    var actions = suggestion.completion.actions;
    actions.forEach(function(obj) {
      console.log(obj);
    });

    var input = $('.typeahead').typeahead('val');
    $('.typeahead').typeahead.previous_value = input;
  });

  $('.typeahead').on('input', function(evt) {
    $('.typeahead').typeahead.input_state = evt.target.value;
  });
});

