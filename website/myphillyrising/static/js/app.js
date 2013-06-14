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
    eventRegion: '#event-region .content',
    storyRegion: '#story-region .content',
    pageRegion: '#page'
  });

  NS.app.pageRegion.on('show', function() {
    $(NS.app.pageRegion.el).removeClass('is-closed');
    $('body').addClass('is-page-open');
  });

  NS.app.pageRegion.on('close', function() {
    $(NS.app.pageRegion.el).addClass('is-closed');
    $('body').removeClass('is-page-open');
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

  NS.app.addInitializer(function(options) {
    console.log('render stories');
    var view = new NS.StoryCollectionView({
          collection: options.storyCollection
        });

    NS.app.storyRegion.show(view);
  });

  // Views ====================================================================
  NS.DetailPageView = Backbone.Marionette.ItemView.extend({
    events: {
      'click .close-btn': 'closeDetails'
    },
    closeDetails: function(evt) {
      evt.preventDefault();
      NS.app.pageRegion.close();
    }
  });

  NS.ItemWithDetailPageView = Backbone.Marionette.ItemView.extend({
    events: {
      'click .feed-item-title a': 'showDetails'
    },
    showDetails: function(evt) {
      evt.preventDefault();

      var DetailView = Backbone.Marionette.getOption(this, 'detailView');
      NS.app.pageRegion.show(new DetailView({
        model: this.model
      }));
    }
  });

  // Resource Views ===========================================================
  NS.ResourceDetailView = NS.DetailPageView.extend({
    template: '#rss-detail-tpl'
  });

  NS.ResourceItemView = NS.ItemWithDetailPageView.extend({
    template: '#rss-item-tpl',
    detailView: NS.ResourceDetailView
  });

  NS.ResourceCollectionView = A.OrderedCollectionView.extend({
    itemView: NS.ResourceItemView
  });

  // Event Views ==============================================================
  NS.EventDetailView = NS.DetailPageView.extend({
    template: '#ics-detail-tpl'
  });

  NS.EventItemView = NS.ItemWithDetailPageView.extend({
    template: '#ics-item-tpl',
    detailView: NS.EventDetailView
  });

  NS.EventCollectionView = A.OrderedCollectionView.extend({
    itemView: NS.EventItemView
  });

  // Story Views ==============================================================
  NS.StoryItemView = Backbone.Marionette.ItemView.extend({
    template: function(modelObj) {
      if (modelObj.source_type === 'Facebook') {
        return Handlebars.compile($('#facebook-item-tpl').html())(modelObj);
      }
      return '<h1>no template found</h1>';
    }
  });

  NS.StoryCollectionView = A.OrderedCollectionView.extend({
    itemView: NS.StoryItemView
  });

  // Init =====================================================================
  $(function() {
    var resourceCollection = new A.ContentItemCollection(),
        eventCollection = new A.ContentItemCollection(),
        storyCollection = new A.ContentItemCollection();

    resourceCollection.comparator = function(model) {
      return model.get('title');
    };

    eventCollection.comparator = function(model) {
      return model.get('source_content').DTSTART;
    };

    storyCollection.comparator = function(model) {
      return model.get('source_posted_at');
    };

    resourceCollection.fetch({data: {category: 'Resource'}});
    eventCollection.fetch({data: {category: 'Event'}});
    storyCollection.fetch({data: {category: 'Story'}});

    NS.app.start({
      resourceCollection: resourceCollection,
      eventCollection: eventCollection,
      storyCollection: storyCollection
    });
  });

}(MyPhillyRising, Alexander));