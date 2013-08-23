/*globals Alexander Backbone Handlebars $ _ L lvector Modernizr */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  // Router ===================================================================
  NS.scrollTops = {};
  NS.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      'contact': 'contact',
      'about': 'about',
      '_=_': 'facebookAuthRedirect',
      ':neighborhood': 'neighborhoodHome',
      ':neighborhood/places': 'neighborhoodPlaces',
      ':neighborhood/:category': 'neighborhoodCategoryList',
      ':neighborhood/:category/:id': 'neighborhoodCategoryItem',
      '*anything': 'home'
    },
    navigate: function(fragment, options) {
      var __super__ = Backbone.Marionette.AppRouter.prototype,
          path = NS.Utils.getCurrentPath();
      options = options || {};

      NS.scrollTops[path] = document.body.scrollTop || document.documentElement.scrollTop || 0;
      this.noscroll = options.noscroll;
      return __super__.navigate.call(this, fragment, options);
    }
  });

  NS.controller = {
    contact: function() {
      NS.app.mainRegion.show(new NS.ContactView());
    },
    about: function() {
      NS.app.mainRegion.show(new NS.AboutView());
    },
    neighborhoodHome: function(neighborhood) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood});
      if (neighborhoodModel) {
        NS.app.vent.trigger('neighborhoodchange', neighborhoodModel);

        // TODO: Need users too!
        NS.app.mainRegion.show(new NS.NeighborhoodHomeView({
          model: neighborhoodModel,
          userModel: NS.app.currentUser
        }));
      } else {
        this.home();
      }
    },

    neighborhoodCategoryList: function(neighborhood, category) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood});
      if (neighborhoodModel) {
        NS.app.vent.trigger('neighborhoodchange', neighborhoodModel);

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
        } else {
          this.neighborhoodHome(neighborhood);
          NS.app.router.navigate(neighborhood, {replace: true});
        }
      } else {
        this.home();
      }
    },
    neighborhoodCategoryItem: function(neighborhood, category, id) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood}),
          self = this,
          view, itemModel;

      if (neighborhoodModel) {
        NS.app.vent.trigger('neighborhoodchange', neighborhoodModel);

        itemModel = neighborhoodModel.collections[category].get(id);
        if (!itemModel) {
          itemModel = new A.ContentItemModel({id: id});
          itemModel.fetch({
            error: function() {
              NS.app.router.navigate(neighborhood + '/' + category, {replace: true});
              self.neighborhoodCategoryList(neighborhood, category);
            }
          });
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
        } else {
          this.neighborhoodHome(neighborhood);
          NS.app.router.navigate(neighborhood, {replace: true});
          return;
        }

      } else {
        this.home();
      }
    },
    neighborhoodPlaces: function(neighborhood) {
      var neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood}),
          view;

      if (neighborhoodModel) {
        NS.app.vent.trigger('neighborhoodchange', neighborhoodModel);

        var placeConfig = _.clone(NS.Config.facilities);

        _.each(placeConfig, function(p) {
          p.center = [neighborhoodModel.get('center_lat'), neighborhoodModel.get('center_lng')];
        });

        view = new NS.PlaceCategoryView({
          model: neighborhoodModel,
          collection: new A.PlaceConfigCollection(placeConfig)
        });

        NS.app.mainRegion.show(view);
      } else {
        this.home();
      }
    },

    home: function() {
      // This is the default route - I could be anywhere
      if (NS.app.currentUser && NS.app.currentUser.has('profile')) {
        NS.app.router.navigate(NS.app.currentUser.get('profile').neighborhood, {trigger: true});
      } else {
        // No neighborhood is selected
        NS.app.vent.trigger('neighborhoodchange', null);
        // Blank out the url
        NS.app.router.navigate('', {replace: true});
        // Show the anonymous user home page
        NS.app.mainRegion.show(new NS.HomeView({
          collection: NS.app.neighborhoodCollection
        }));
      }
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

  // App ======================================================================
  NS.app = new Backbone.Marionette.Application();

  NS.app.addRegions({
    mainRegion: '#main-region',
    headerRegion: '#header-region',
    neighborhoodMenuRegion: '#neighborhood-menu-region',
    userMenuRegion: '#user-menu-region',
    notificationRegion: '#notification-region'
  });

  NS.app.vent.on('neighborhoodchange', function(neighborhoodModel) {
    if (neighborhoodModel) {
      // Update the neighborhood label when the neighborhood changes
      NS.app.headerView.descriptionRegion.show(new NS.NeighborhoodLabelView({
        model: neighborhoodModel
      }));

      // Fetch the content models if not already done
      neighborhoodModel.fetchCollectionData();

      // Set the current neighborhood tag
      NS.app.currentNeighborhood = neighborhoodModel.get('tag');
    } else {
      // Update the neighborhood label when the neighborhood changes
      NS.app.headerView.descriptionRegion.show(new NS.NeighborhoodLabelView({
        model: new Backbone.Model()
      }));

      // Set the current neighborhood tag
      NS.app.currentNeighborhood = '';
    }

    // Render the neighborhood menu to update the currently-selected neighborhood
    NS.app.neighborhoodMenuView.render();
  });

  // Initializers =============================================================
  NS.app.addInitializer(function(options){
    this.neighborhoodCollection = new NS.NeighborhoodCollection(NS.bootstrapped.neighborhoodData);
    this.currentUser = new NS.UserModel(NS.bootstrapped.currentUserData);
    this.currentUser.url = function() { return NS.UserCollection.prototype.url + '/' + this.id; };

    this.currentUser.on('action', function(actionModel, options) {
      var neighborhood = this.get('profile').neighborhood,
          points = actionModel.get('points'),
          neighborhoodModel = NS.app.neighborhoodCollection.findWhere({tag: neighborhood}),
          neighborhoodPoints = neighborhoodModel.get('points') + points;

      // Update neighborhood points
      neighborhoodModel.set('points', neighborhoodPoints);

      if (actionModel.get('type') !== 'signup') {
        NS.app.notificationRegion.show(new NS.PointsNotificationView({
          model: new Backbone.Model({
            user_points: points,
            neighborhood_points: neighborhoodPoints,
            neighborhood: neighborhoodModel.get('name'),
            notification: options.notification
          })
        }));
      }
    });

    // Is this the first time the user has signed in?
    if (NS.app.currentUser.hasSignedIn() === false) {
      NS.app.currentUser.doAction(
        {points: 10, type: 'signup'},
        null
      );
    }

    // Create the header
    this.headerView = new NS.HeaderView();
    NS.app.headerRegion.show(this.headerView);

    // Construct a new app router
    this.router = new NS.Router({
      controller: NS.controller
    });

    // Page-view analytics. This needs to go before the history is started in
    // order to register the initial page load.
    this.router.bind('route', function(route, router) {
      NS.Utils.log('send', 'pageview', NS.Utils.getCurrentPath());
    });

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

    // Update login URLs when the route changes
    this.router.bind('route', function(route, router) {
      $('.twitter-login-link').attr('href', NS.Utils.getLoginUrl({service: 'twitter'}));
      $('.facebook-login-link').attr('href', NS.Utils.getLoginUrl({service: 'facebook'}));
    });

    // Scroll to the top, or to the last-known scroll position for the route
    this.router.bind('route', function(route, router) {
      var scrollTop = NS.scrollTops[NS.Utils.getCurrentPath()] || 0;
      if (!this.noscroll) {
        document.body.scrollTop = document.documentElement.scrollTop = scrollTop;
      }
    });

    // Start the router
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