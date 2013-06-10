/*globals Backbone $ Handlebars _ */

var Alexander = Alexander || {};

(function(NS) {
  $(function() {
    var collection = new NS.FeedCollection(),
        feedListView = new NS.FeedListView({
          el: '#feeds-list',
          collection: collection
        });

    $('#feed-form').on('submit', function(evt) {
      evt.preventDefault();
      var form = this,
          formArray = $(form).serializeArray(),
          modelObj = {};

      _.each(formArray, function(obj){
        modelObj[obj.name] = obj.value;
      });

      collection.create(modelObj, {
        wait: true,
        success: function() {
          form.reset();
        },
        error: function() {
          // TODO: make nicer
          window.alert('Unable to save. Please try again.');
        }
      });

    });

    collection.fetch();
  });
}(Alexander));