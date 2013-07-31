/*globals Alexander Backbone Handlebars $ _ L lvector */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  // Router ===================================================================
  NS.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      ':neighborhood': 'neighborhoodHome',
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



      console.log('show a category list', neighborhoodModel.collections[category], category);
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

  // Init Map
  // NS.app.addInitializer(NS.Map.initiadlizer);

  NS.app.addInitializer(function(options){
    // TODO: Bootstrap data please
    this.neighborhoodCollection = new A.NeighborhoodCollection([
      {tag: 'kensington'}
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