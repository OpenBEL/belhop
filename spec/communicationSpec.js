describe('belhop', function() {

  describe('can', function() {

    it('execute live tests', function(done) {
      $.ajax({
        type: 'HEAD',
        async: true,
        url: belhop.DEFAULT_URL,
        success: function() { done(); },
        error: function(xhr, strstatus, strerror) {
          console.log('error');
          console.log(xhr.statusCode());
          console.log(strstatus);
          console.log(strerror);
        }
      });
    });

  });

});
