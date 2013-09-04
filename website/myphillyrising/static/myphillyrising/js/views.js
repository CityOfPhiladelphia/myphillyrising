/*globals Alexander Backbone Handlebars $ _ L WufooForm */

var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  // Views ====================================================================
  NS.OrderedCollectionMixin = {
    // https://github.com/marionettejs/backbone.marionette/wiki/Adding-support-for-sorted-collections
    // Inspired by the above link, but it doesn't work when you start with an
    // empty (or unsorted) list.
    appendHtml: function(collectionView, itemView, index){
      var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el,
          children = childrenContainer.children(),
          indices = childrenContainer.data('indices') || [],
          sortNumber = function(a,b) { return a - b; },
          goHereIndex;
      // console.log(index, $(itemView.el).find('.feed-item-title').text());

      // console.log('before', indices);
      indices.push(index);
      indices.sort(sortNumber);
      // console.log('after', indices);
      goHereIndex = indices.indexOf(index);
      // console.log('at', goHereIndex);

      if(goHereIndex === 0) {
        childrenContainer.prepend(itemView.el);
        // console.log('prepend');
      } else {
        // console.log('insert after', childrenContainer.children().eq(goHereIndex-1).find('.feed-item-title').text());
        childrenContainer.children().eq(goHereIndex-1).after(itemView.el);
      }

      // console.log(childrenContainer)
      childrenContainer.data('indices', indices);
    }
  };

  // User Menu View ===================================================
  NS.UserMenuView = Backbone.Marionette.ItemView.extend({
    template: '#user-menu-tpl',

    events: {
      'submit .user-profile': 'onSubmitProfileForm'
    },

    onSubmitProfileForm: function(evt) {
      evt.preventDefault();
      var form = evt.target,
          attrName, fieldVal,
          userData = {'profile': NS.app.currentUser.get('profile')},
          originalNeighborhood = userData.profile.neighborhood;

      for (attrName in userData.profile) {
        fieldVal = this.getFieldValue(attrName);
        if (fieldVal !== undefined) {
          userData.profile[attrName] = fieldVal;
        }
      }
      userData.email = this.getFieldValue('email');

      this.$('.save-profile-button').prop('disabled', true);
      NS.app.currentUser.save(userData, {
        complete: function() {
          $(form).find('.save-profile-button').prop('disabled', false);
        },
        success: function() {
          if (userData.profile.neighborhood !== originalNeighborhood) {
            NS.app.router.navigate('/' + userData.profile.neighborhood, {trigger: true});
          }

          $('body').removeClass('is-open-off-canvas-left')
            .removeClass('is-open-off-canvas-right');
        },
        error: function() {
          window.alert('Unable to save your profile. Please try again.');
        }
      });
    },

    getFieldValue: function(name) {
      var $field = this.$('[name="' + name + '"]');

      if ($field.length > 0) {
        if ($field.attr('type') === 'checkbox') {
          return $field.is(':checked');
        } else {
          return $field.val();
        }
      }
    }
  });

  // Header View
  NS.HeaderView = Backbone.Marionette.Layout.extend({
    template: '#header-tpl',
    regions: {
      descriptionRegion: '.site-description-region',
      leftRegion: '.header-left-region'
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

  NS.HeaderNeighborhoodSelectorView = Backbone.Marionette.ItemView.extend({
    template: '#header-neighborhood-selector-tpl',
    tagName: 'span'
  });

  NS.HeaderBreadcrumbButtonView = Backbone.Marionette.ItemView.extend({
    template: '#header-breadcrumb-button-tpl',
    tagName: 'span'
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
      $('body').removeClass('is-open-off-canvas-left');
      $('body').removeClass('is-open-off-canvas-right');

      // Select as the current neighborhood
      $('.is-current-neighborhood').removeClass('is-current-neighborhood');
      this.$('a').addClass('is-current-neighborhood');
    }
  });

  NS.NeighborhoodMenuView = Backbone.Marionette.CompositeView.extend({
    template: '#neighborhood-menu-tpl',
    itemView: NS.NeighborhoodMenuItemView,
    itemViewContainer: '.neighborhood-list',
    events: {
      'click .content-link': 'hideMenus'
    },
    hideMenus: function() {
      // Hide the menu
      $('body').removeClass('is-open-off-canvas-left');
      $('body').removeClass('is-open-off-canvas-right');
    }
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
      messageRegion: '.neighborhood-message',
      usersRegion1: '.users-region1',
      usersRegion2: '.users-region2',
      usersRegion3: '.users-region3',
      usersRegion4: '.users-region4',
      eventsRegion1: '.events-region1',
      storiesRegion1: '.stories-region1',
      resourcesRegion1: '.resources-region1'
    },
    events: {
      'click .btn-off-canvas-menu-right': 'showUserMenu'
    },
    initialize: function(options) {
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
      if (options.userModel) {
        this.listenTo(options.userModel, 'action', function(actionModel, options) {
          if (actionModel.get('type') === 'signup') {
            this.messageRegion.show(new NS.SignupNotificationView({
              model: new Backbone.Model({
                user_points: actionModel.get('points'),
                neighborhood: this.model.get('name')
              })
            }));
          }
        });
      }
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
      this.eventsRegion1.show(new NS.HomeEventListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.events.slice(0, 1))
      }));
    },
    renderResources: function() {
      this.resourcesRegion1.show(new NS.HomeResourceListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.resources.slice(0, 1))
      }));
    },
    renderStories: function() {
      this.storiesRegion1.show(new NS.HomeStoryListView({
        model: this.model,
        collection: new Backbone.Collection(this.model.collections.stories.slice(0, 3))
      }));
    },
    showUserMenu: function(evt) {
      $('body').removeClass('is-open-off-canvas-left')
        .toggleClass('is-open-off-canvas-right');

      window.scrollTo(0, 0);
      evt.preventDefault();
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
    itemView: NS.ResourceItemView,
    appendHtml: NS.OrderedCollectionMixin.appendHtml
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
    template: '#ics-detail-tpl',

    events: {
      'click .event-attending-action': 'onEventAttendingActionClicked',
      'click .show-user-menu-link': 'showUserMenu'
    },

    modelEvents: {
      'action': 'redrawAttendees'
    },

    onEventAttendingActionClicked: function(evt) {
      var user = NS.app.currentUser,
          ev = this.model;

      if (!user.hasDoneAction('rsvp', ev)) {
        user.doAction({type: 'rsvp', points: 5}, ev, {notification: 'You RSVP\'d for "' + NS.Utils.unescapeHtml(ev.get('title')) + '"'});
      }

      if (ev.isInProgress() && !user.hasDoneAction('check-in', ev)) {
        user.doAction({type: 'check-in', points: 10}, ev, {notification: 'You checked in to "' + NS.Utils.unescapeHtml(ev.get('title')) + '"'});
      }
    },

    redrawAttendees: function() {
      var html = Handlebars.templates['event-rsvp-list-tpl'](this.model.toJSON());
      this.$('.event-attendee-list').html(html);
    },

    showUserMenu: function(evt) {
      $('body').removeClass('is-open-off-canvas-left')
        .toggleClass('is-open-off-canvas-right');

      window.scrollTo(0, 0);
      evt.preventDefault();
    }
  });

  NS.EventItemView = Backbone.Marionette.ItemView.extend({
    template: '#ics-item-tpl'
  });

  NS.EventCollectionView = NS.PaginatedCompositeView.extend({
    template: '#ics-list-tpl',
    itemView: NS.EventItemView,
    appendHtml: NS.OrderedCollectionMixin.appendHtml
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
    itemView: NS.StoryItemView,
    appendHtml: NS.OrderedCollectionMixin.appendHtml

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

  // Place Views ==============================================================
  NS.PlaceItemView = Backbone.Marionette.ItemView.extend({
    template: '#place-item-tpl',
    tagName: 'li'
  });

  NS.PlaceListView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.PlaceItemView,
    tagName: 'ul',
    className: 'unstyled-list'
  });

  NS.PlaceCategoryItemView = Backbone.Marionette.Layout.extend({
    template: '#place-category-item-tpl',
    tagName: 'li',
    ui: {
      count: '.place-list-count'
    },
    regions: {
      listRegion: '.place-list-region'
    },
    events: {
      'click .place-category-header': 'handleCategoryClick'
    },
    initialize: function() {
      this.model.collection.on('reset', function(collection) {
        if (collection.size() === 0) {
          this.$el.hide();
        } else {
          this.ui.count.text('(' + collection.size() + ')');
        }
      }, this);
    },
    onRender: function() {
      var center = this.model.get('center');

      this.listRegion.show(new NS.PlaceListView({
        collection: this.model.collection
      }));

      this.model.collection.fetch();
    },
    handleCategoryClick: function(evt) {
      evt.preventDefault();
      this.$('.place-category-item').toggleClass('is-open');
    }
  });

  NS.PlaceCategoryView = Backbone.Marionette.CompositeView.extend({
    template: '#place-category-tpl',
    itemView: NS.PlaceCategoryItemView,
    itemViewContainer: '.place-category-list',
    events: {
      'click .place-category-map-btn': 'showMap',
      'click .map-list-toggle-btn': 'showList'
    },
    initialize: function() {
      var self = this;
      $(window).resize(_.debounce(function(evt) {
        self.resizeMap();
      }, 100));
    },
    resizeMap: function() {
      var $map = this.$('#map');
      $map.height(window.innerHeight - $map.parent()[0].offsetTop);
    },
    onShow: function() {
      this.resizeMap();

      var url = 'http://{s}.tiles.mapbox.com/v3/openplans.map-dmar86ym/{z}/{x}/{y}.png',
          attribution = '&copy; OpenStreetMap contributors, CC-BY-SA. <a href="http://mapbox.com/about/maps" target="_blank">Terms/Feedback</a>',
          baseLayer = L.tileLayer(url, {attribution: attribution});

      this.map = L.map('map', {
        layers: [baseLayer],
        center: [this.model.get('center_lat'), this.model.get('center_lng')],
        zoom: 14,
        scrollWheelZoom: false
      });

      // Remove default prefix
      this.map.attributionControl.setPrefix('');

      this.featureGroup = L.featureGroup().addTo(this.map);
    },
    addMarker: function(model, collection, options) {
      var geom = model.get('geom'),
          markerLayer;

      if (geom && geom.x && geom.y) {
        markerLayer = L.marker([geom.y, geom.x], {
          data: model.toJSON(),
          icon: L.icon({
            iconUrl: NS.staticURL + 'myphillyrising/images/markers/' + (model.get('icon') || 'marker-default.png'),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],

            shadowUrl: NS.staticURL + 'myphillyrising/images/markers/' + (model.get('iconShadow') || 'marker-shadow.png'),
            shadowSize: [41, 41]
          })
        });

        markerLayer.bindPopup(
          '<strong>' + model.get('name') + '</strong><br>' +
          model.get('address') + ' (' + model.get('label') + ')');
        this.featureGroup.addLayer(markerLayer);
      }
    },
    showMap: function(evt) {
      var self = this;

      evt.preventDefault();

      // Clear all markers from the map
      this.featureGroup.clearLayers();

      // Get the collection for this type from the button
      var placeConfigModel = this.collection.get($(evt.currentTarget).attr('data-id'));

      // Add a marker for each category model
      placeConfigModel.collection.each(function(m) {
        self.addMarker(m);
      });

      this.map.fitBounds(this.featureGroup.getBounds());
      this.scrollTop = $('body').scrollTop();

      this.$el.addClass('map-is-active');
      window.scrollTo(0,0);

      // Make sure everything is sized up nicely
      this.resizeMap();
    },
    showList: function(evt) {
      evt.preventDefault();

      this.$el.removeClass('map-is-active');
      window.scrollTo(0, this.scrollTop);
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

  NS.SignupNotificationView = Backbone.Marionette.ItemView.extend({
    template: '#signup-notification-tpl'
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