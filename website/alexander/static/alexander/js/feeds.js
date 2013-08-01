/*globals Backbone $ Handlebars _ */

var Alexander = Alexander || {};

(function(NS) {
  $(function() {
    var collection = new NS.FeedCollection(),
        view = new NS.FeedListView({
          el: '#feeds-list',
          collection: collection
        }),
        feedFormView = new NS.FeedFormView({
          el: '#feed-form-container',
          collection: collection
        }).render();

    collection.fetch();
  });
}(Alexander));