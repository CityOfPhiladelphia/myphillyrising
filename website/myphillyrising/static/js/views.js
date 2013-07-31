/*globals Alexander Backbone Handlebars $ _ */

var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  // Views ====================================================================
  NS.DetailPageView = Backbone.Marionette.ItemView.extend({
    events: {
      'click .close-btn': 'closeDetails'
    },
    closeDetails: function(evt) {
      evt.preventDefault();
      NS.app.pageRegion.close();
    }
  });

  NS.ItemWithDetailPageView = Backbone.Marionette.ItemView.extend({
    events: {
      'click .feed-item-title a': 'handleClick'
    },
    handleClick: function(evt) {
      evt.preventDefault();
      this.showDetails();
    },
    showDetails: function() {
      var DetailView = Backbone.Marionette.getOption(this, 'detailView');
      NS.app.pageRegion.show(new DetailView({
        model: this.model
      }));
      NS.app.router.navigate(this.model.get('category').toLowerCase() + '/' + NS.app.currentNeighborhood + '/' + this.model.id);
    },
    onRender: function() {
      if (NS.app.currentPageId === this.model.id) {
        this.showDetails();
      }
    }
  });

  // Resource Views ===========================================================
  NS.ResourceDetailView = Backbone.Marionette.ItemView.extend({
    template: '#rss-detail-tpl'
  });

  NS.ResourceItemView = Backbone.Marionette.ItemView.extend({
    template: '#rss-item-tpl',
    detailView: NS.ResourceDetailView
  });

  NS.ResourceCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.ResourceItemView
  });

  // Event Views ==============================================================
  NS.EventDetailView = Backbone.Marionette.ItemView.extend({
    template: '#ics-detail-tpl'
  });

  NS.EventItemView = Backbone.Marionette.ItemView.extend({
    template: '#ics-item-tpl',
    detailView: NS.EventDetailView
  });

  NS.EventCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.EventItemView
  });

  // Story Views ==============================================================
  NS.StoryItemView = Backbone.Marionette.ItemView.extend({
    template: function(modelObj) {
      if (modelObj.source_type === 'Facebook') {
        return Handlebars.compile($('#facebook-item-tpl').html())(modelObj);
      }
      return '<h1>no template found</h1>';
    }
  });

  NS.StoryCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.StoryItemView
  });

  // Map Views ==============================================================
  NS.MapItemView = Backbone.Marionette.ItemView.extend({
    template: '#map-item-tpl'
  });

  NS.MapCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.MapItemView,
    events: {
      'click .map-list-item': 'handleClick'
    },
    handleClick: function(evt) {
      var $el = this.$(evt.currentTarget);
      // Remove all of the .is-selected
      this.$('.map-list-item').removeClass('is-selected');
      // Add .is-selected to the item
      $el.addClass('is-selected');

      NS.Map.panTo($el.attr('data-id'));
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