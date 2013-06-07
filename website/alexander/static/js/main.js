var Alexander = Alexander || {};

(function(NS) {

  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  NS.FeedModel = Backbone.Model.extend({});

  NS.FeedCollection = Backbone.Collection.extend({
    url: '/api/feeds',
    model: NS.FeedModel
  });

  NS.FeedView = Backbone.Marionette.ItemView.extend({
    template: "#feed-item-tpl",
    tagName: 'li',
    className: 'feed-item well'
  });

  NS.FeedListView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.FeedView
  });

  $(function() {
    var collection = new NS.FeedCollection(),
        feedListView = new NS.FeedListView({
          el: '#feeds-list',
          collection: collection
        });

    collection.fetch();
  });

}(Alexander));