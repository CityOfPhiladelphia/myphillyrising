/*globals Alexander Backbone Handlebars $ _ Swiper L lvector */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  // Router ===================================================================
  NS.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      '!\/:category/:neighborhood(/)(:page)': 'route',
      '*anything': 'home'
    }
  });

  NS.controller = {
    route: function(category, neighborhood, id) {
      var lowerCat = category ? category.toLowerCase() : '',
          index = $('[data-name="'+lowerCat+'"]').index();

      NS.app.currentNeighborhood = neighborhood;

      _.each(NS.app.filteredCollections, function(collection) {
        collection.filter(function(model) {
          if (!neighborhood) {
            // Show all if no neighborhood provided
            return true;
          }
          return (neighborhood && model.get('tags').indexOf(neighborhood) !== -1);
        });
      });

      // Cache the current page id
      NS.app.currentPageId = parseInt(id, 10);

      NS.Map.update(NS.app.currentNeighborhood,
        NS.Config.neighborhoods[NS.app.currentNeighborhood].center);

      NS.app.swiper.swipeTo(index, 500, false);
    },
    home: function() {
      NS.app.router.navigate('');
      NS.app.swiper.swipeTo(0, 0, false);
    }
  };

  // App ======================================================================
  NS.app = new Backbone.Marionette.Application();

  NS.app.addRegions({
    resourceRegion: '#resource-region .content',
    eventRegion: '#event-region .content',
    storyRegion: '#story-region .content',
    mapListRegion: '#map-region .map-list',
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
  NS.app.getPanelInitializer = function(category, comparator, View, region) {
    return function(options) {
      console.log('Render', category);

      var collection = new A.ContentItemCollection(),
          lowerCat = category.toLowerCase(),
          view;

      this.filteredCollections[lowerCat] = A.FilteredCollection(collection);
      this.filteredCollections[lowerCat].comparator = comparator;

      collection.fetch({
        reset: true, // Important! Runs the filtering in the FilteredCollection
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
    this.currentNeighborhood = 'market-east';
  });

  // Initialize Panels ========================================================
  NS.app.addInitializer(NS.app.getPanelInitializer(
    'Resource',
    'title',
    NS.ResourceCollectionView,
    NS.app.resourceRegion
  ));

  NS.app.addInitializer(NS.app.getPanelInitializer(
    'Event',
    function(model) { return model.get('source_content').DTSTART; },
    NS.EventCollectionView,
    NS.app.eventRegion
  ));

  NS.app.addInitializer(NS.app.getPanelInitializer(
    'Story',
    function(a, b) {
      return a.get('source_posted_at') < b.get('source_posted_at') ? 1 : -1;
    },
    NS.StoryCollectionView,
    NS.app.storyRegion
  ));

  // Init Map
  NS.app.addInitializer(NS.Map.initializer);

  // Initialize Swiping
  NS.app.addInitializer(function(options){
    var self = this;
    this.swiper=new Swiper('#panels', {
      simulateTouch: false,
      mode: 'horizontal',
      loop: false,
      onSlideChangeEnd: function() {
        var slide = self.swiper.getSlide(self.swiper.activeIndex),
            category = $(slide).attr('data-name');

        self.router.navigate('!/' + category + '/' + (self.currentNeighborhood || ''));
      }
    });

    $('.prev').click(function(e){
      self.swiper.swipePrev();
      e.preventDefault();
    });
    $('.next').click(function(e){
      self.swiper.swipeNext();
      e.preventDefault();
    });

    $('.profile-open-btn').click(function(e){
      $('#profile').toggleClass('is-closed');
      $('body').toggleClass('is-profile-open');
      e.preventDefault();
    });

    $('.profile-close-btn').click(function(e){
      $('#profile').addClass('is-closed');
      $('body').removeClass('is-profile-open');
      e.preventDefault();
    });

    $('.panel-nav a').click(function(evt) {
      var index = $(this).parent('li').index();
      self.swiper.swipeTo(index, 500, true);
      evt.preventDefault();
    });
  });

  NS.app.addInitializer(function(options){
    console.log('make and start a router');
    // Construct a new app router
    this.router = new NS.Router({
      controller: NS.controller
    });
    Backbone.history.start();
  });

  // Init =====================================================================
  $(function() {
    NS.app.start();
  });

}(MyPhillyRising, Alexander));