/*globals Alexander Backbone Handlebars $ _ L lvector Modernizr */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  // Router ===================================================================
  NS.scrollTops = {};
  NS.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      'about': 'about',
      '_=_': 'facebookAuthRedirect',
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
    about: function() {
      NS.app.mainRegion.show(new NS.AboutView());
    },
    neighborhoodHome: function(neighborhood) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood});

      if (neighborhoodModel === undefined) {
        this.home();
        return;
      }

      NS.app.currentNeighborhood = neighborhood;

      // Init and update the content models if not already done
      neighborhoodModel.initContentCollections();

      // TODO: Need users too!
      console.log('make a home page view', neighborhoodModel);
      NS.app.mainRegion.show(new NS.NeighborhoodHomeView({
        model: neighborhoodModel
      }));
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
        itemModel = new A.ContentItemModel({id: parseInt(id, 10)});
        itemModel.fetch();
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
      // This is the default route - I could be anywhere
      // if (NS.app.currentUser && NS.app.currentUser.neighborhood) {
        // NS.app.router.navigate(NS.app.currentUser.neighborhood, {trigger: true});
      // } else {
        NS.app.router.navigate('', {replace: true});
        NS.app.mainRegion.show(new NS.HomeView({
          collection: NS.app.neighborhoodCollection
        }));
      // }
    },

    facebookAuthRedirect: function() {
      // Due to a bug in Facebook's OAuth redirection, we always get back a
      // hash of _=_. The app will think that's a neighborhood unless we do
      // something. This should only be a problem for the home route. See
      // https://developers.facebook.com/bugs/317224701698736?browse=external_tasks_search_results_51fab56f7448d2531771258
      // or http://stackoverflow.com/q/7693663/123776 for more information.
      this.home();
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
    mainRegion: '#main-region',
    headerRegion: '#header-region',
    neighborhoodMenuRegion: '#neighborhood-menu-region',
    userMenuRegion: '#user-menu-region'
  });

  // Initializers =============================================================
  NS.app.addInitializer(function(options){
    this.neighborhoodCollection = new A.NeighborhoodCollection(NS.bootstrapped.neighborhoodData);
    this.currentUser = new NS.UserModel(NS.bootstrapped.currentUserData);

    var headerView = new NS.HeaderView();
    NS.app.headerRegion.show(headerView);

    // Create the neighborhood menu
    NS.app.neighborhoodMenuView = new NS.NeighborhoodMenuView({
      collection: this.neighborhoodCollection
    });
    NS.app.neighborhoodMenuRegion.show(NS.app.neighborhoodMenuView);

    // Create the user menu
    NS.app.userMenuView = new NS.UserMenuView({
      model: this.currentUser
    });
    NS.app.userMenuRegion.show(NS.app.userMenuView);

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

      if (// Exempt the following routes
          (href.indexOf('/api') !== 0 &&
           href.indexOf('/log') !== 0 && // login or logout
           href.indexOf('/admin') !== 0 &&
           href.indexOf('/djangoadmin') !== 0) &&

          // Allow shift+click for new tabs, etc.
          (!evt.altKey && !evt.ctrlKey && !evt.metaKey && !evt.shiftKey)) {

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