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
      'click .feed-item-title a': 'showDetails'
    },
    showDetails: function(evt) {
      evt.preventDefault();

      var DetailView = Backbone.Marionette.getOption(this, 'detailView');
      NS.app.pageRegion.show(new DetailView({
        model: this.model
      }));
    }
  });

  // Resource Views ===========================================================
  NS.ResourceDetailView = NS.DetailPageView.extend({
    template: '#rss-detail-tpl'
  });

  NS.ResourceItemView = NS.ItemWithDetailPageView.extend({
    template: '#rss-item-tpl',
    detailView: NS.ResourceDetailView
  });

  NS.ResourceCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.ResourceItemView
  });

  // Event Views ==============================================================
  NS.EventDetailView = NS.DetailPageView.extend({
    template: '#ics-detail-tpl'
  });

  NS.EventItemView = NS.ItemWithDetailPageView.extend({
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

}(MyPhillyRising));