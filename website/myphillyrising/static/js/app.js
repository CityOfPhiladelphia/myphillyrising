/*globals Alexander Backbone Handlebars $ _ */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

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

  NS.ResourceCollectionView = Backbone.Marionette.CollectionView.extend({
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

  NS.EventCollectionView = Backbone.Marionette.CollectionView.extend({
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

  NS.StoryCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.StoryItemView
  });

  // App ======================================================================
  NS.app = new Backbone.Marionette.Application();

  NS.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      '!\/:category(/)(:neighborhood)(/)': 'route',
      '*anything': 'home'
    }
  });

  NS.controller = {
    route: function(category, neighborhood) {
      var lowerCat = category ? category.toLowerCase() : '';

      console.log('route', arguments, this);
      console.log('go to this panel:', category);
      console.log('only show stuff for this neighborhood:', neighborhood);

      _.each(NS.app.filteredCollections, function(collection) {
        collection.filter(function(model) {
          if (!neighborhood) {
            // Show all if no neighborhood provided
            return true;
          }
          return (neighborhood && model.get('tags').indexOf(neighborhood) !== -1);
        });
      });
    },
    home: function() {
      console.log('home', arguments, this);
      NS.controller.route();
    }
  };

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

  // Initializers =============================================================
  NS.app.getInitializer = function(category, comparator, View, region) {
    return function(options) {
      console.log('Render', category);

      var collection = new A.ContentItemCollection(),
          lowerCat = category.toLowerCase(),
          view;

      this.filteredCollections[lowerCat] = A.FilteredCollection(collection);
      this.filteredCollections[lowerCat].comparator = comparator;

      collection.fetch({
        reset: true,
        data: { category: category }
      });

      view = new View({
        collection: this.filteredCollections[lowerCat]
      });

      region.show(view);
    };
  };


  NS.app.addInitializer(function() {
    this.filteredCollections = {};
  });

  // Initialize Panels ========================================================
  NS.app.addInitializer(NS.app.getInitializer(
    'Resource',
    'title',
    NS.ResourceCollectionView,
    NS.app.resourceRegion
  ));

  NS.app.addInitializer(NS.app.getInitializer(
    'Event',
    function(model) { return model.get('source_content').DTSTART; },
    NS.EventCollectionView,
    NS.app.eventRegion
  ));

  NS.app.addInitializer(NS.app.getInitializer(
    'Story',
    function(a, b) {
      return a.get('source_posted_at') < b.get('source_posted_at') ? 1 : -1;
    },
    NS.StoryCollectionView,
    NS.app.storyRegion
  ));

  NS.app.addInitializer(function(options){
    console.log('make and start a router');
    // Construct a new app router
    new NS.Router({
      controller: NS.controller
    });
    Backbone.history.start();
  });

  // Init =====================================================================
  $(function() {
    NS.app.start();
  });

}(MyPhillyRising, Alexander));