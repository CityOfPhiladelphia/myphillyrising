/*globals Alexander Backbone Handlebars $ */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  // App ======================================================================
  NS.app = new Backbone.Marionette.Application();

  NS.app.addRegions({
    resourceRegion: '#resource-region .content',
    eventRegion: '#event-region .content'
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

  NS.app.addInitializer(function(options) {
    console.log('render events');
    var view = new NS.EventCollectionView({
          collection: options.eventCollection
        });

    NS.app.eventRegion.show(view);
  });

  // Views ====================================================================
  NS.ResourceItemView = Backbone.Marionette.ItemView.extend({
    template: '#resource-item-tpl',
  });

  NS.ResourceCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.ResourceItemView
  });

  NS.EventItemView = Backbone.Marionette.ItemView.extend({
    template: '#event-item-tpl',
  });

  NS.EventCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.EventItemView
  });

  // Init =====================================================================
  $(function() {
    var resourceCollection = new A.ContentItemCollection(),
        eventCollection = new A.ContentItemCollection();

    resourceCollection.fetch({data: {category: 'Resource'}});
    eventCollection.fetch({data: {category: 'Event'}});

    NS.app.start({
      resourceCollection: resourceCollection,
      eventCollection: eventCollection
    });
  });

}(MyPhillyRising, Alexander));