/*globals Alexander Backbone Handlebars $ _ L */

var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  // Views ====================================================================

  // User Menu View ===================================================
  NS.UserMenuView = Backbone.Marionette.ItemView.extend({
    template: '#user-menu-tpl'
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
    template: '#neighborhood-label-tpl'
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
    template: '#neighborhood-home-tpl'
  });

  NS.HomeView = Backbone.Marionette.CompositeView.extend({
    template: '#home-tpl',
    itemView: NS.NeighborhoodMenuItemView,
    itemViewContainer: '.neighborhood-list',
  });

  // Resource Views ===========================================================
  NS.ResourceDetailView = Backbone.Marionette.ItemView.extend({
    template: '#rss-detail-tpl',
    modelEvents: { 'change': 'render'}
  });

  NS.ResourceItemView = Backbone.Marionette.ItemView.extend({
    template: '#rss-item-tpl'
  });

  NS.ResourceCollectionView = NS.PaginatedCompositeView.extend({
    itemView: NS.ResourceItemView
  });

  // Event Views ==============================================================
  NS.EventDetailView = Backbone.Marionette.ItemView.extend({
    template: '#ics-detail-tpl',
    modelEvents: { 'change': 'render'}
  });

  NS.EventItemView = Backbone.Marionette.ItemView.extend({
    template: '#ics-item-tpl'
  });

  NS.EventCollectionView = NS.PaginatedCompositeView.extend({
    itemView: NS.EventItemView
  });

  // Story Views ==============================================================
  NS.StoryDetailView = Backbone.Marionette.ItemView.extend({
    template: '#facebook-detail-tpl',
    modelEvents: { 'change': 'render'}
  });

  NS.StoryItemView = Backbone.Marionette.ItemView.extend({
    template: '#facebook-item-tpl'
  });

  NS.StoryCollectionView = NS.PaginatedCompositeView.extend({
    itemView: NS.StoryItemView
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
      $('.map-content').scrollTop($el.get(0).offsetTop);
    }
  });

  NS.AboutView = Backbone.Marionette.ItemView.extend({
    template: '#about-tpl'
  });

}(MyPhillyRising));