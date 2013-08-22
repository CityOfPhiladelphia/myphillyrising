/*globals Alexander Backbone Handlebars $ _ L WufooForm */

var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  // Views ====================================================================

  // User Menu View ===================================================
  NS.UserMenuView = Backbone.Marionette.ItemView.extend({
    template: '#user-menu-tpl',

    events: {
      'change #user-menu-neighborhood-field': 'onNeighborhoodChange',
      'change #user-menu-email-field': 'onEmailChange',
      'change #user-menu-email-permission-field': 'onEmailPermissionChange'
    },

    onNeighborhoodChange: function() {
      var $field = this.$('#user-menu-neighborhood-field'),
          newNeighborhood = $field.val(),
          profileData = NS.app.currentUser.get('profile');

      if ($field[0].checkValidity()) {
        profileData['neighborhood'] = newNeighborhood;
        NS.app.currentUser.save({'profile': profileData}, {
          success: function() {
            $field.find('.empty-neighborhood-option').remove();
          },
          error: function() {
            // TODO: Let the user know, and switch back the neighborhood.
          }
        });
      }
    },

    onEmailChange: function() {
      var $field = this.$('#user-menu-email-field'),
          newEmail = $field.val();

      if ($field[0].checkValidity()) {
        NS.app.currentUser.save({'email': newEmail});
      }
    },

    onEmailPermissionChange: function() {
      var $field = this.$('#user-menu-email-permission-field'),
          newEmailPermission = $field.is(':checked'),
          profileData = NS.app.currentUser.get('profile');

      if ($field[0].checkValidity()) {
        profileData['email_permission'] = newEmailPermission;
        NS.app.currentUser.save({'profile': profileData});
      }
    }
  });

  // Header View
  NS.HeaderView = Backbone.Marionette.Layout.extend({
    template: '#header-tpl',
    regions: {
      descriptionRegion: '.site-description'
    },
    events: {
      'click .btn-off-canvas-menu-left': 'showNeighborhoodMenu',
      'click .btn-off-canvas-menu-right': 'showUserMenu',
      'click .btn-canvas-center': 'hideMenus'
    },
    showNeighborhoodMenu: function(evt) {
      $('body').removeClass('is-open-off-canvas-right')
        .toggleClass('is-open-off-canvas-left');
      evt.preventDefault();
    },
    showUserMenu: function(evt) {
      $('body').removeClass('is-open-off-canvas-left')
        .toggleClass('is-open-off-canvas-right');

      window.scrollTo(0, 0);
      evt.preventDefault();
    },
    hideMenus: function(evt) {
      $('body').removeClass('is-open-off-canvas-left')
        .removeClass('is-open-off-canvas-right');
      evt.preventDefault();
    }
  });

  NS.NeighborhoodLabelView = Backbone.Marionette.ItemView.extend({
    template: '#neighborhood-label-tpl',
    tagName: 'span'
  });

  // Neighborhood Menu View ===================================================
  NS.NeighborhoodMenuItemView = Backbone.Marionette.ItemView.extend({
    template: '#neighborhood-menu-item-tpl',
    tagName: 'li',
    events: {
      'click': 'onClick'
    },

    onClick: function(evt) {
      // Hide the menu
      $("body").removeClass("is-open-off-canvas-left");
      $("body").removeClass("is-open-off-canvas-right");

      // Select as the current neighborhood
      $('.is-current-neighborhood').removeClass('is-current-neighborhood');
      this.$('a').addClass('is-current-neighborhood');
    }
  });

  NS.NeighborhoodMenuView = Backbone.Marionette.CompositeView.extend({
    template: '#neighborhood-menu-tpl',
    itemView: NS.NeighborhoodMenuItemView,
    itemViewContainer: '.neighborhood-list',
  });

  NS.PaginatedCompositeView = Backbone.Marionette.CompositeView.extend({
    template: '#paginated-list-tpl',
    itemViewContainer: '.content-list',
    events: {
      'click .load-more-action': 'onClickLoadMore'
    },

    collectionEvents: {
      add: function() {
        this.setLoadButtonVisibility(!!this.collection.nextPage);
      },
      reset: function() {
        this.setLoadButtonVisibility(!!this.collection.nextPage);
      }
    },

    onClickLoadMore: function() {
      this.loadMoreContentItems();
    },

    loadMoreContentItems: function() {
      var self = this;
      this.collection.fetchNextPage(function(collection, response, options) {
        self.setLoadButtonVisibility(!!collection.nextPage);
      });
    },

    setLoadButtonVisibility: function(show) {
      this.$('.load-more-action').toggleClass('is-hidden', !show);
    }
  });

  // Home View ================================================================
  NS.NeighborhoodHomeView = Backbone.Marionette.Layout.extend({
    template: '#neighborhood-home-tpl',
    regions: {
      usersRegion1: '.users-region1',
      usersRegion2: '.users-region2',
      usersRegion3: '.users-region3',
      usersRegion4: '.users-region4',
      eventsRegion1: '.events-region1',
      storiesRegion1: '.stories-region1',
      resourcesRegion1: '.resources-region1'
    },
    initialize: function() {
      this.listenTo(this.model.collections.users, 'reset', function() {
        this.renderUsers();
      });
      this.listenTo(this.model.collections.events, 'reset', function() {
        this.renderEvents();
      });
      this.listenTo(this.model.collections.resources, 'reset', function() {
        this.renderResources();
      });
      this.listenTo(this.model.collections.stories, 'reset', function() {
        this.renderStories();
      });
    },
    onRender: function() {
      if(this.model.collections.users.isSynced) {
        this.renderUsers();
      }
      if(this.model.collections.events.isSynced) {
        this.renderEvents();
      }
      if(this.model.collections.resources.isSynced) {
        this.renderResources();
      }
      if(this.model.collections.stories.isSynced) {
        this.renderStories();
      }
    },
    onShow: function() {
      /* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
      var disqus_shortname = 'devphillyrising'; // required: replace example with your forum shortname

      /* * * DON'T EDIT BELOW THIS LINE * * */
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    },
    renderUsers: function() {
      console.log('render users for', this.model.get('tag'));

      this.usersRegion1.show(new NS.HomeUserListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.users.slice(0, 3))
      }));
      this.usersRegion2.show(new NS.HomeUserListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.users.slice(3, 6))
      }));
      this.usersRegion3.show(new NS.HomeUserListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.users.slice(6, 8))
      }));
      this.usersRegion4.show(new NS.HomeUserListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.users.slice(8, 10))
      }));

    },
    renderEvents: function() {
      console.log('render events for', this.model.get('tag'));

      this.eventsRegion1.show(new NS.HomeEventListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.events.slice(0, 1))
      }));
    },
    renderResources: function() {
      console.log('render resources for', this.model.get('tag'));

      this.resourcesRegion1.show(new NS.HomeResourceListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.resources.slice(0, 1))
      }));
    },
    renderStories: function() {
      console.log('render stories for', this.model.get('tag'));

      this.storiesRegion1.show(new NS.HomeStoryListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.stories.slice(0, 3))
      }));
    }
  });

  NS.HomeView = Backbone.Marionette.CompositeView.extend({
    template: '#home-tpl',
    events: {
      'click .btn-off-canvas-menu-right': 'showUserMenu'
    },
    itemView: NS.NeighborhoodMenuItemView,
    itemViewContainer: '.neighborhood-list',
    showUserMenu: function(evt) {
      $('body').removeClass('is-open-off-canvas-left')
        .toggleClass('is-open-off-canvas-right');

      window.scrollTo(0, 0);
      evt.preventDefault();
    }
  });

  NS.BaseDetailView = Backbone.Marionette.ItemView.extend({
    initialize: function() {
      var self = this;
      if (window.stLight && MyPhillyRising.app.currentUser) {
        //register the callback function with sharethis
        window.stLight.subscribe('click', function(event, service) {
          // Award points to the user for sharing a thing
          if (NS.app.currentUser) {
            NS.app.currentUser.doAction(
              {points: 5, type: 'share'},
              self.model,
              {notification: 'You shared "' + NS.Utils.unescapeHtml(self.model.get('title')) + '"'}
            );
          }
        });
      }
    },
    modelEvents: { 'change': 'render'},
    onShow: function() {
      // Sometimes rendering happens after show, sometimes before
      if (window.stButtons && window.stButtons.locateElements) {
        window.stButtons.locateElements();
      }
    },
    onRender: function() {
      // Sometimes rendering happens after show, sometimes before
      if (window.stButtons && window.stButtons.locateElements) {
        window.stButtons.locateElements();
      }
    }
  });

  // Resource Views ===========================================================
  NS.ResourceDetailView = NS.BaseDetailView.extend({
    template: '#rss-detail-tpl'
  });

  NS.ResourceItemView = Backbone.Marionette.ItemView.extend({
    template: '#rss-item-tpl'
  });

  NS.ResourceCollectionView = NS.PaginatedCompositeView.extend({
    template: '#rss-list-tpl',
    itemView: NS.ResourceItemView
  });

  NS.HomeResourceItemView = Backbone.Marionette.ItemView.extend({
    template: '#home-resource-item-tpl',
    tagName: 'li'
  });

  NS.HomeResourceListView = Backbone.Marionette.CompositeView.extend({
    template: '#home-resource-list-tpl',
    itemView: NS.HomeResourceItemView,
    itemViewContainer: '.item-view-container'
  });

  // Event Views ==============================================================
  NS.EventDetailView = NS.BaseDetailView.extend({
    template: '#ics-detail-tpl'
  });

  NS.EventItemView = Backbone.Marionette.ItemView.extend({
    template: '#ics-item-tpl'
  });

  NS.EventCollectionView = NS.PaginatedCompositeView.extend({
    template: '#ics-list-tpl',
    itemView: NS.EventItemView
  });

  NS.HomeEventItemView = Backbone.Marionette.ItemView.extend({
    template: '#home-event-item-tpl',
    tagName: 'li'
  });

  NS.HomeEventListView = Backbone.Marionette.CompositeView.extend({
    template: '#home-event-list-tpl',
    itemView: NS.HomeEventItemView,
    itemViewContainer: '.item-view-container'
  });

  // Story Views ==============================================================
  NS.StoryDetailView = NS.BaseDetailView.extend({
    template: '#facebook-detail-tpl'
  });

  NS.StoryItemView = Backbone.Marionette.ItemView.extend({
    template: function(modelObj) {
      if (modelObj.source_type === 'rss') {
        return Handlebars.compile($('#rss-item-tpl').html())(modelObj);
      }
      // Default to Facebook template
      return Handlebars.compile($('#facebook-item-tpl').html())(modelObj);
    }
  });

  NS.StoryCollectionView = NS.PaginatedCompositeView.extend({
    template: '#facebook-list-tpl',
    itemView: NS.StoryItemView
  });

  NS.HomeStoryItemView = Backbone.Marionette.ItemView.extend({
    template: '#home-story-item-tpl',
    tagName: 'li'
  });

  NS.HomeStoryListView = Backbone.Marionette.CompositeView.extend({
    template: '#home-story-list-tpl',
    itemView: NS.HomeStoryItemView,
    itemViewContainer: '.item-view-container'
  });

  // User Views ==============================================================
  NS.HomeUserItemView = Backbone.Marionette.ItemView.extend({
    template: '#home-user-item-tpl',
    tagName: 'li'
  });

  NS.HomeUserListView = Backbone.Marionette.CompositeView.extend({
    template: '#home-user-list-tpl',
    itemView: NS.HomeUserItemView,
    itemViewContainer: '.item-view-container'
  });

  // Map Views ==============================================================
  NS.MapItemView = Backbone.Marionette.ItemView.extend({
    template: '#map-item-tpl'
  });

  NS.MapView = Backbone.Marionette.CompositeView.extend({
    template: '#map-tpl',
    itemView: NS.MapItemView,
    itemViewContainer: '.map-list',
    events: {
      'click .map-list-item': 'handleClick'
    },
    onShow: function() {
      var url = 'http://{s}.tiles.mapbox.com/v3/openplans.map-dmar86ym/{z}/{x}/{y}.png',
          attribution = '&copy; OpenStreetMap contributors, CC-BY-SA. <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>',
          baseLayer = L.tileLayer(url, {attribution: attribution});

      this.map = L.map('map', {
        layers: [baseLayer],
        center: [this.model.get('center_lat'), this.model.get('center_lng')],
        zoom: 16
      });

      // Remove default prefix
      this.map.attributionControl.setPrefix('');

      this.featureGroup = L.featureGroup().addTo(this.map);

      this.featureGroup.on('click', function(evt) {
        this.selectItem(evt.layer.options.data.id);
      }, this);

      this.listenTo(this.collection, 'add', this.addMarker);

      this.collection.fetch({
        center: [this.model.get('center_lat'), this.model.get('center_lng')]
      });
    },
    addMarker: function(model, collection, options) {
      var geom = model.get('geom');
      if (geom && geom.x && geom.y) {
        this.featureGroup.addLayer(L.marker([geom.y, geom.x], {
          data: model.toJSON(),
          icon: L.icon({
            iconUrl: NS.staticURL + 'myphillyrising/images/markers/marker-'+model.get('type')+'.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],

            shadowUrl: NS.staticURL + 'myphillyrising/images/markers/marker-shadow.png',
            shadowSize: [41, 41]
          })
        }));
      }
    },
    handleClick: function(evt) {
      var $el = this.$(evt.currentTarget),
          model = this.collection.get($el.attr('data-id')),
          geom = model.get('geom'),
          type = model.get('type');

      // Set the map image
      this.setStaticMapImage($el, geom, type);
      // Remove all of the .is-selected
      this.$('.map-list-item').removeClass('is-selected');
      // Add .is-selected to the item
      $el.addClass('is-selected');

      this.map.setView([geom.y, geom.x], 16);
    },
    selectItem: function(id) {
      var $el = this.$('[data-id="'+id+'"]'),
          model = this.collection.get(id),
          geom = model.get('geom'),
          type = model.get('type');

      // Set the map image
      this.setStaticMapImage($el, geom, type);
      // Remove all of the .is-selected
      this.$('.map-list-item').removeClass('is-selected');
      // Add .is-selected to the item
      $el.addClass('is-selected');
      // Move it into view
      this.getMapListContainer().scrollTop($el.get(0).offsetTop);
    },
    setStaticMapImage: function ($el, geom, type) {
      if (geom && geom.x && geom.y) {
        var mapboxServiceUrl = 'http://api.tiles.mapbox.com/v3/openplans.map-dmar86ym/',
            encodedMarkerUrl = encodeURIComponent('http://' + NS.bootstrapped.hostName + NS.bootstrapped.staticUrl + 'myphillyrising/images/markers/marker-' + type + '.png') + '(' + geom.x + ',' + geom.y + ')';
        $el.find('img.static-map').attr('src', mapboxServiceUrl + 'url-'+encodedMarkerUrl + '/' + geom.x+','+geom.y+',17/600x300.png');
      }
    },
    getMapListContainer: function() {
      return $(document.body || document.documentElement);
    }
  });

  NS.AboutView = Backbone.Marionette.ItemView.extend({
    template: '#about-tpl'
  });

  NS.ContactView = Backbone.Marionette.ItemView.extend({
    template: '#contact-tpl',
    onShow: function() {
      var form;

      try {
        form = new WufooForm();
        form.initialize(NS.wufooFormConfig);
        form.display();
      } catch (e) {
        // Meh
      }
    }
  });

  NS.PointsNotificationView = Backbone.Marionette.ItemView.extend({
    template: '#points-notification-tpl',
    className: 'notification is-closed',
    events: {
      'click .close-btn': function(evt) {
        evt.preventDefault();
        // Hide the message
        this.$el.addClass('is-closed');
      }
    },
    onShow: function() {
      this.$el.removeClass('is-closed');
    }
  });

}(MyPhillyRising));