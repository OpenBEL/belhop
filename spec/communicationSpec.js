describe('belhop', function () {

  beforeEach(function(done) {
    $.ajax({
      type: 'HEAD',
      async: true,
      url: belhop.DEFAULT_URL,
      success: function(message) {
        done();
      },
      error: function(xhr, strstatus, strerror) {
        console.log('error');
        console.log(xhr.statusCode());
        console.log(strstatus);
        console.log(strerror);
      }
    });
  });

  it('can communicate with the configured URL', function(done) {
    done();
  });

});
