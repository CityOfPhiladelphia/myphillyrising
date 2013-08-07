/*globals Alexander Backbone Handlebars $ _ L Masonry */

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
      // Re-render the neighborhood menu in case the currently-selected
      // neighborhood has changed.
      NS.app.neighborhoodMenuView.render();

      $('body').removeClass('is-open-off-canvas-right');
      $('body').toggleClass('is-open-off-canvas-left');
      evt.preventDefault();
    },
    showUserMenu: function(evt) {
      $('body').removeClass('is-open-off-canvas-left');
      $('body').toggleClass('is-open-off-canvas-right');
      evt.preventDefault();
    },
    hideMenus: function(evt) {
      $('body').removeClass('is-open-off-canvas-left');
      $('body').removeClass('is-open-off-canvas-right');
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
      eventsRegion1: '.events-region1',
      storiesRegion1: '.stories-region1',
      usersRegion2: '.users-region2',
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

      this.msnry = new Masonry(this.$('.neighborhood-content').get(0), {
        // options
        columnWidth: '.avatar.masonry',
        itemSelector: '.masonry',
        gutter: 0
      });
    },
    renderUsers: function() {
      console.log('render users for', this.model.get('tag'));

      if (this.model.collections.users.length < 6) {
        this.usersRegion1.show(new NS.HomeUserListView({
          model: this.model,
          collection: new Backbone.Collection(this.model.collections.users.slice(0, 3))
        }));
        this.usersRegion2.show(new NS.HomeUserListView({
          model: this.model,
          collection: new Backbone.Collection(this.model.collections.users.slice(3, 6))
        }));
      }

      else {
        this.usersRegion1.show(new NS.HomeUserListView({
          model: this.model,
          collection: new Backbone.Collection(this.model.collections.users.slice(0, 6))
        }));
        this.usersRegion2.show(new NS.HomeUserListView({
          model: this.model,
          collection: new Backbone.Collection(this.model.collections.users.slice(6, 10))
        }));
      }

      // console.log(this.usersRegion1.$el);
      var region1Els = this.usersRegion1.$el.find('.masonry'),
          region1Len = region1Els.length,
          region2Els = this.usersRegion2.$el.find('.masonry'),
          region2Len = region2Els.length,
          i;

      for (i=0; i<region1Len; i++) {
        this.msnry.appended(region1Els[i]);
      }
      for (i=0; i<region2Len; i++) {
        this.msnry.appended(region2Els[i]);
      }
      this.msnry.layout();
    },
    renderEvents: function() {
      console.log('render events for', this.model.get('tag'));

      this.eventsRegion1.show(new NS.HomeEventListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.events.slice(0, 1))
      }));

      this.msnry.appended(this.eventsRegion1.$el.get(0));
      this.msnry.layout();
    },
    renderResources: function() {
      console.log('render resources for', this.model.get('tag'));

      this.resourcesRegion1.show(new NS.HomeResourceListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.resources.slice(0, 1))
      }));

      this.msnry.appended(this.resourcesRegion1.$el.get(0));
      this.msnry.layout();
    },
    renderStories: function() {
      console.log('render stories for', this.model.get('tag'));

      this.storiesRegion1.show(new NS.HomeStoryListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.stories.slice(0, 3))
      }));

      this.msnry.appended(this.storiesRegion1.$el.get(0));
      this.msnry.layout();
    }
  });

  NS.HomeView = Backbone.Marionette.CompositeView.extend({
    template: '#home-tpl',
    itemView: NS.NeighborhoodMenuItemView,
    itemViewContainer: '.neighborhood-list',
  });

  NS.BaseDetailView = Backbone.Marionette.ItemView.extend({
    modelEvents: { 'change': 'render'},
    onShow: function() {
      // Render ShareThis buttons
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
    template: '#facebook-item-tpl'
  });

  NS.StoryCollectionView = NS.PaginatedCompositeView.extend({
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
        zoom: 13
      });

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
      this.featureGroup.addLayer(L.marker([geom.y, geom.x], {
        data: model.toJSON()
      }));
    },
    handleClick: function(evt) {
      var $el = this.$(evt.currentTarget),
          geom = this.collection.get($el.attr('data-id')).get('geom');
      // Remove all of the .is-selected
      this.$('.map-list-item').removeClass('is-selected');
      // Add .is-selected to the item
      $el.addClass('is-selected');

      this.map.panTo([geom.y, geom.x]);
    },
    selectItem: function(id) {
      var $el = this.$('[data-id="'+id+'"]');
      // Remove all of the .is-selected
      this.$('.map-list-item').removeClass('is-selected');
      // Add .is-selected to the item
      $el.addClass('is-selected');
      // Move it into view
      this.$('.map-list-container').scrollTop($el.get(0).offsetTop);
    }
  });

  NS.AboutView = Backbone.Marionette.ItemView.extend({
    template: '#about-tpl'
  });

}(MyPhillyRising));