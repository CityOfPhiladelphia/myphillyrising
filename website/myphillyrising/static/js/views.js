/*globals Alexander Backbone Handlebars $ _ L */

var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  // Views ====================================================================

  // Resource Views ===========================================================
  NS.ResourceDetailView = Backbone.Marionette.ItemView.extend({
    template: '#rss-detail-tpl',
    modelEvents: { 'change': 'render'}
  });

  NS.ResourceItemView = Backbone.Marionette.ItemView.extend({
    template: '#rss-item-tpl'
  });

  NS.ResourceCollectionView = Backbone.Marionette.CollectionView.extend({
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

  NS.EventCollectionView = Backbone.Marionette.CollectionView.extend({
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

  NS.StoryCollectionView = Backbone.Marionette.CollectionView.extend({
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
        center: this.model.get('center'),
        zoom: 13
      });

      this.featureGroup = L.featureGroup().addTo(this.map);

      this.featureGroup.on('click', function(evt) {
        this.selectItem(evt.layer.options.data.id);
      }, this);

      this.listenTo(this.collection, 'add', this.addMarker);

      this.collection.fetch({
        center: this.model.get('center')
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

}(MyPhillyRising));