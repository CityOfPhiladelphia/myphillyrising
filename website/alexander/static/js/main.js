/*globals Backbone $ Handlebars _ */

var Alexander = Alexander || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  NS.App = new Backbone.Marionette.Application();

  NS.App.addRegions({
    content: '#content'
  });

  NS.App.on('initialize:after', function(){
    Backbone.history.start();
  });

  NS.FeedModel = Backbone.Model.extend({});

  NS.FeedCollection = Backbone.Collection.extend({
    url: '/api/feeds/',
    model: NS.FeedModel
  });

  NS.FeedView = Backbone.Marionette.ItemView.extend({
    template: "#feed-item-tpl",
    tagName: 'li',
    className: 'feed-item well',
    events: {
      'click .delete-feed-link': 'delete'
    },
    delete: function() {
      if (window.confirm('Are you sure you want to delete this feed?')) {
        this.model.destroy();
      }
    }
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

    $('#feed-form').on('submit', function(evt) {
      evt.preventDefault();
      var formArray = $(this).serializeArray(),
          modelObj = {};

      _.each(formArray, function(obj){
        modelObj[obj.name] = obj.value;
      });

      collection.create(modelObj);
      this.reset();
    });

    collection.fetch();
  });

}(Alexander));