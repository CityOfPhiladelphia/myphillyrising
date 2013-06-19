/*globals Backbone $ Handlebars _ */

var Alexander = Alexander || {};

(function(NS) {
  Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
    return Handlebars.compile(rawTemplate);
  };

  NS.defaultTags = [
    { id: 'market-east', label: 'Market East' },
    { id: 'north-central', label: 'North Central' },
    { id: 'pennrose', label: 'Pennrose' },
    { id: 'strawberry-mansion', label: 'Strawberry Mansion' },
    { id: 'hartranft', label: 'Hartranft' },
    { id: 'kensington', label: 'Kensington' },
    { id: 'st-hughs', label: 'St Hugh\'s' },
    { id: 'frankford', label: 'Frankford' },
    { id: 'lawncrest', label: 'Lawncrest' },
    { id: 'swampoodle-allegheny-west', label: 'Swampoodle/Allegheny West' },
    { id: 'point-breeze', label: 'Point Breeze' },
    { id: 'southeast', label: 'Southeast' },
    { id: 'elmwood', label: 'Elmwood' },
    { id: 'haddington', label: 'Haddington' },
    { id: 'kingsessing', label: 'Kingsessing' }
  ];

  // Views
  NS.DefaultTagView = Backbone.Marionette.ItemView.extend({
    serializeData: function() {
      var data = NS.DefaultTagView.__super__.serializeData.call(this);
      data.defaultTags = NS.defaultTags;
      return data;
    }
  });

  NS.FeedFormView = NS.DefaultTagView.extend({
    template: '#feed-form-tpl',
    events: {
      'submit form': 'onSubmit'
    },
    onRender: function() {
      this.$('#default-tags').select2({
        placeholder: 'Tags',
        width: '100%'
      });
    },
    onSubmit: function(evt) {
      evt.preventDefault();
      var form = evt.target,
          formArray = $(form).serializeArray(),
          modelObj = {};

      _.each(formArray, function(obj){
        if (obj.name === 'default_tags') {
          if (!modelObj[obj.name]) {
            modelObj[obj.name] = [];
          }
          modelObj[obj.name].push(obj.value);
        } else {
          modelObj[obj.name] = obj.value;
        }
      });

      this.collection.create(modelObj, {
        wait: true,
        success: function() {
          form.reset();
          $('#default-tags').select2('val', '');
        },
        error: function() {
          // TODO: make nicer
          window.alert('Unable to save. Please try again.');
        }
      });
    }
  });

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

  NS.ContentItemTagView = NS.DefaultTagView.extend({
    template: '#item-tags-tpl',
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
      var self = this;

      this.$('select')
          .val(this.model.get('tags'))
          .select2({
            width: '100%'
          })
          .on('change', function(evt) {
            self.saveTags(evt.val);
          });
    }
  });

  NS.ContentItemView = Backbone.Marionette.Layout.extend({
    template: '#content-item-tpl',
    tagName: 'li',
    className: 'content-item well',
    contentTemplates: {
      'ICS': '#ics-item-tpl',
      'RSS': '#rss-item-tpl',
      'Facebook': '#facebook-item-tpl'
    },
    regions: {
      content: '.content',
      tags: '.tags'
    },
    onRender: function() {
      this.content.show(new Backbone.Marionette.ItemView({
        template: this.contentTemplates[this.model.get('source_type')],
        model: this.model
      }));

      this.tags.show(new NS.ContentItemTagView({
        model: this.model
      }));
    }
  });

  NS.ContentItemListView = Backbone.Marionette.CollectionView.extend({
    itemView: NS.ContentItemView
  });

}(Alexander));