/*globals Alexander Backbone Handlebars $ _ L lvector Modernizr */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  // Router ===================================================================
  NS.scrollTops = {};
  NS.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      ':neighborhood': 'neighborhoodHome',
      ':neighborhood/map': 'neighborhoodMap',
      ':neighborhood/:category': 'neighborhoodCategoryList',
      ':neighborhood/:category/:id': 'neighborhoodCategoryItem',
      '*anything': 'home'
    },
    navigate: function(fragment, options) {
      var __super__ = Backbone.Marionette.AppRouter.prototype,
          path = NS.getCurrentPath();
      options = options || {};

      NS.scrollTops[path] = document.body.scrollTop || document.documentElement.scrollTop || 0;
      this.noscroll = options.noscroll;
      return __super__.navigate.call(this, fragment, options);
    }
  });

  NS.controller = {
    neighborhoodHome: function(neighborhood) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood});
      NS.app.currentNeighborhood = neighborhood;
      // Init and update the content models if not already done
      neighborhoodModel.initContentCollections();

      // TODO: Need users too!
      console.log('make a home page view', neighborhoodModel);
    },

    neighborhoodCategoryList: function(neighborhood, category) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood});
      NS.app.currentNeighborhood = neighborhood;
      // Init and update the content models if not already done
      neighborhoodModel.initContentCollections();

      if (category === 'events') {
        NS.app.mainRegion.show(new NS.EventCollectionView({
          collection: neighborhoodModel.collections[category]
        }));
      } else if (category === 'resources') {
        NS.app.mainRegion.show(new NS.ResourceCollectionView({
          collection: neighborhoodModel.collections[category]
        }));
      } else if (category === 'stories') {
        NS.app.mainRegion.show(new NS.StoryCollectionView({
          collection: neighborhoodModel.collections[category]
        }));
      }
    },
    neighborhoodCategoryItem: function(neighborhood, category, id) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood}),
          view;
      NS.app.currentNeighborhood = neighborhood;

      // Init and update the content models if not already done
      neighborhoodModel.initContentCollections();

      var itemModel = neighborhoodModel.collections[category].get(parseInt(id, 10));

      if (!itemModel) {
        console.log(id, 'is not here, better to go get it.');
        itemModel = new A.ContentItemModel({id: parseInt(id, 10)});
        console.log('fetching', itemModel);
      }

      if (category === 'events') {
        NS.app.mainRegion.show(new NS.EventDetailView({
          model: itemModel
        }));
      } else if (category === 'resources') {
        NS.app.mainRegion.show(new NS.ResourceDetailView({
          model: itemModel
        }));
      } else if (category === 'stories') {
        NS.app.mainRegion.show(new NS.StoryDetailView({
          model: itemModel
        }));
      }


itemModel.fetch();
      console.log('show a category item', itemModel);
    },
    neighborhoodMap: function(neighborhood) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood}),
          view = new NS.MapView({
            model: neighborhoodModel,
            collection: new A.FacilitiesCollection([], {config: NS.Config.facilities})
          });
      NS.app.currentNeighborhood = neighborhood;
      NS.app.mainRegion.show(view);
    },

    home: function() {
      NS.app.router.navigate('');
    }
  };

  NS.getCurrentPath = function() {
    var root = Backbone.history.root,
        fragment = Backbone.history.fragment;
    return root + fragment;
  };

  // App ======================================================================
  NS.app = new Backbone.Marionette.Application();

  NS.app.addRegions({
    mainRegion: '#main-region'
  });

  // Initializers =============================================================

  NS.app.addInitializer(function(options){
    $(".btn-off-canvas-menu-left").click(function(e) {
      $("body").removeClass("is-open-off-canvas-right");
      $("body").toggleClass("is-open-off-canvas-left");
      e.preventDefault();
    });
    $(".btn-off-canvas-menu-right").click(function(e) {
      $("body").removeClass("is-open-off-canvas-left");
      $("body").toggleClass("is-open-off-canvas-right");
      e.preventDefault();
    });
    $(".btn-canvas-center").click(function(e) {
      $("body").removeClass("is-open-off-canvas-left");
      $("body").removeClass("is-open-off-canvas-right");
      e.preventDefault();
    });
  });

  // Init Map
  // NS.app.addInitializer(NS.Map.initiadlizer);

  NS.app.addInitializer(function(options){
    // TODO: Bootstrap data please
    this.neighborhoodCollection = new A.NeighborhoodCollection([
      {tag: 'kensington', center: [39.9949, -75.1185]},
      {tag: 'market-east', center: [39.9515, -75.1567]}
    ]);

    console.log('make and start a router');
    // Construct a new app router
    this.router = new NS.Router({
      controller: NS.controller
    });

    Backbone.history.start({ pushState: Modernizr.history, silent: true });

    if(!Modernizr.history) {
      var rootLength = Backbone.history.options.root.length,
          fragment = window.location.pathname.substr(rootLength),
          url;

      if (fragment) {
        Backbone.history.navigate(fragment, { trigger: true });
        url = window.location.protocol + '//' + window.location.host +
            Backbone.history.options.root + '#' + fragment;

        // Do a full redirect so we don't get urls like /visions/7#visions/7
        window.location = url;
      } else {
        Backbone.history.loadUrl(Backbone.history.getFragment());
      }
    } else {
      Backbone.history.loadUrl(Backbone.history.getFragment());
    }

    // Globally capture clicks. If they are internal and not in the pass
    // through list, route them through Backbone's navigate method.
    $(document).on('click', 'a[href^="/"]', function(evt) {
      var $link = $(evt.currentTarget),
          href = $link.attr('href'),
          noscroll = !_.isUndefined($link.attr('data-noscroll')),
          replace = !_.isUndefined($link.attr('data-replace')),
          url;

      // Allow shift+click for new tabs, etc.
      if ((href === '/' ||
           href.indexOf('/api') !== 0 ||
           href.indexOf('/admin') !== 0 ||
           href.indexOf('/djangoadmin') !== 0) &&
           !evt.altKey && !evt.ctrlKey && !evt.metaKey && !evt.shiftKey) {
        evt.preventDefault();

        // Remove leading slashes and hash bangs (backward compatablility)
        url = href.replace(/^\//, '').replace('#!/', '');

        // # Instruct Backbone to trigger routing events
        NS.app.router.navigate(url, {
          trigger: true,
          noscroll: noscroll,
          replace: replace
        });

        return false;
      }
    });
  });

  // Init =====================================================================
  $(function() {
    NS.app.start();
  });

}(MyPhillyRising, Alexander));