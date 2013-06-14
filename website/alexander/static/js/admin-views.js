/*globals Backbone $ Handlebars _ */

var Alexander = Alexander || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  NS.defaultTags = [
    'Market East',
    'North Central',
    'Pennrose',
    'Strawberry Mansion',
    'Hartranft',
    'Kensington',
    'St Hughs',
    'Frankford',
    'Lawncrest',
    'Swampoodle/Allegheny West',
    'Point Breeze',
    'Southeast',
    'Elmwood',
    'Haddington',
    'Kingsessing'
  ];

  // Views
  NS.FeedView = Backbone.Marionette.ItemView.extend({
    template: "#feed-tpl",
    tagName: 'li',
    className: 'feed-item well',
    events: {
      'click .delete-feed-link': 'delete',
      'click .refresh-feed-link': 'refresh'
    },
    delete: function() {
      if (window.confirm('Are you sure you want to delete this feed?')) {
        this.model.destroy({
          wait: true,
          error: function() {
            // TODO: make nicer
            window.alert('Unable to delete. Please try again.');
          }
        });
      }
    },
    refresh: function() {
      this.model.refresh();
    }
  });

  NS.FeedListView = NS.OrderedCollectionView.extend({
    itemView: NS.FeedView
  });

  NS.ContentItemView = Backbone.Marionette.ItemView.extend({
    template: '#content-item-tpl',
    tagName: 'li',
    className: 'content-item well',
    templates: {
      'ICS': '#event-item-tpl',
      'RSS': '#resource-item-tpl',
      'Facebook': '#facebook-item-tpl'
    },
    saveTags: function(tags) {
      this.model.save({'tags': tags}, {
        patch: true,
        wait: true,
        error: function() {
          // TODO
          console.error('unable to save tags - handle it');
        }
      });
    },
    onRender: function() {
      var self = this,
          data = this.model.toJSON(),
          content = Backbone.Marionette.Renderer.render(this.templates[data.source_type], data);

      this.$('.content').html(content);

      this.$('input.tag-input')
        .val(this.model.get('tags').join(','))
        .select2({
          tags: NS.defaultTags,
          tokenSeparators: [',', ' '],
          width: '100%'
        }).on('change', function(evt) {
          self.saveTags(evt.val);
        });
    }
  });

  NS.ContentItemListView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.ContentItemView
  });

}(Alexander));