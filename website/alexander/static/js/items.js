/*globals Backbone $ Handlebars _ */

var Alexander = Alexander || {};

(function(NS) {
  $(function() {
    var collection = new NS.ContentItemCollection(),
        view = new NS.ContentItemListView({
          el: '#items-list',
          collection: collection
        });
    collection.fetch();
  });
}(Alexander));