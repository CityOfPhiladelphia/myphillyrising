/*globals Backbone $ Handlebars _ */

var Alexander = Alexander || {};

(function(NS) {
  $(function() {
    var collection = new NS.ContentItemCollection(),
        view = new NS.ContentItemListView({
          el: '#content-item-list-wrapper',
          collection: collection
        }).render();
    collection.fetch();
  });
}(Alexander));