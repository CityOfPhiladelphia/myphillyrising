/*globals Alexander Backbone Handlebars $ _ L lvector */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  // Router ===================================================================
  NS.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      ':neighborhood': 'neighborhoodHome',
      ':neighborhood/map': 'neighborhoodMap',
      ':neighborhood/:category': 'neighborhoodCategoryList',
      ':neighborhood/:category/:id': 'neighborhoodCategoryItem',
      '*anything': 'home'
    }
  });

  NS.controller = {
    neighborhoodHome: function(neighborhood) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood});
      // Init and update the content models if not already done
      neighborhoodModel.initContentCollections();

      // TODO: Need users too!
      console.log('make a home page view', neighborhoodModel);
    },

    neighborhoodCategoryList: function(neighborhood, category) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood});
      // Init and update the content models if not already done
      neighborhoodModel.initContentCollections();

      if (category === 'event') {
        NS.app.mainRegion.show(new NS.EventCollectionView({
          collection: neighborhoodModel.collections[category]
        }));
      } else if (category === 'resource') {
        NS.app.mainRegion.show(new NS.ResourceCollectionView({
          collection: neighborhoodModel.collections[category]
        }));
      } else if (category === 'story') {
        NS.app.mainRegion.show(new NS.StoryCollectionView({
          collection: neighborhoodModel.collections[category]
        }));
      }
    },
    neighborhoodCategoryItem: function(neighborhood, category, id) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood});

      // Init and update the content models if not already done
      neighborhoodModel.initContentCollections();

      var itemModel = neighborhoodModel.collections[category].get(parseInt(id, 10));

      if (!itemModel) {
        console.log(id, 'is not here, better to go get it.');
      }

      console.log('show a category item', itemModel);
    },
    neighborhoodMap: function(neighborhood) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood}),
          view = new NS.MapView({
            model: neighborhoodModel,
            collection: new A.FacilitiesCollection([], {config: NS.Config.facilities})
          });
      NS.app.mainRegion.show(view);
    },

    home: function() {
      NS.app.router.navigate('');
    }
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
    Backbone.history.start();
  });

  // Init =====================================================================
  $(function() {
    NS.app.start();
  });

}(MyPhillyRising, Alexander));