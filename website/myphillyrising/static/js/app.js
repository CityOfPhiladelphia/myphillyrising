var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  NS.app = new Backbone.Marionette.Application();

  NS.app.addRegions({
    resourceRegion: '#resource-region .content'
  });

  NS.app.addInitializer(function(options){
    console.log('make and start a router');
    // Construct a new app router
    // Backbone.history.start();
  });

  NS.app.addInitializer(function(options) {
    console.log('render resources');
    var view = new NS.ResourceCollectionView({
          collection: options.resourceCollection
        });

    NS.app.resourceRegion.show(view);
  });

  //
  NS.ContentItemModel = Backbone.Model.extend({
    parse: function(resp, options) {
      resp.source_content = JSON.parse(resp.source_content);
      return resp;
    },
    sync: function(method, model, options) {
      var data = options.attrs || model.toJSON(options);
      if (method !== 'read' && method !== 'destroy') {
        options.data = data;
        options.data.source_content = JSON.stringify(data.source_content);
      }

      options.data = JSON.stringify(data);
      options.contentType = 'application/json';
      return Backbone.sync(method, model, options);
    }
  });

  NS.ContentItemCollection = Backbone.Collection.extend({
    url: '/api/items/',
    model: NS.ContentItemModel
  });

  NS.ResourceItemView = Backbone.Marionette.ItemView.extend({
    template: '#resource-item-tpl',
    tagName: 'p'
  });

  NS.ResourceCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.ResourceItemView
  });


  // Init
  $(function() {
    var resourceCollection = new NS.ContentItemCollection();

    resourceCollection.fetch();

    NS.app.start({
      resourceCollection: resourceCollection
    });
  });

}(MyPhillyRising));