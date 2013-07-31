/*globals Backbone $ _ */

var Alexander = Alexander || {};

(function(NS) {
  NS.AgsCollection = Backbone.Collection.extend({
    parse: function(response) {
      return response.features;
    }
  });

  // Models and Collections
  NS.FilteredCollection = function(original){
    var filtered = new original.constructor();

    // allow this object to have it's own events
    filtered._callbacks = {};

    // call 'filter' on the original function so that
    // filtering will happen from the complete collection
    filtered.filter = function(criteria){
        var items;

        // call 'filter' if we have criteria
        // or just get all the models if we don't
        if (criteria){
            items = original.filter(criteria);
        } else {
            items = original.models;
        }

        // store current criteria
        filtered._currentCriteria = criteria;

        // reset the filtered collection with the new items
        filtered.reset(items);
    };

    // when the original collection is reset,
    // the filtered collection will re-filter itself
    // and end up with the new filtered result set
    original.on("reset", function(){
        filtered.filter(filtered._currentCriteria);
    });
    original.on("add", function(){
        console.info('implement filtered add');
    });
    original.on("remove", function(){
        console.info('implement filtered remove');
    });

    return filtered;
  };

  NS.FeedModel = Backbone.Model.extend({
    refresh: function() {
      $.ajax({
        url: this.url() + '/refresh/',
        type: 'PUT'
      });
    }
  });

  NS.FeedCollection = Backbone.Collection.extend({
    url: '/api/feeds/',
    model: NS.FeedModel,
    comparator: 'title'
  });

  NS.ContentItemModel = Backbone.Model.extend({
    parse: function(resp, options) {
      resp.source_content = JSON.parse(resp.source_content);
      return resp;
    },
    sync: function(method, model, options) {
      var data = options.attrs || model.toJSON(options);
      if (method !== 'read' && method !== 'destroy') {
        options.data = data;
        options.data.source_content = JSON.stringify(data.source_content);
      }

      options.data = JSON.stringify(data);
      options.contentType = 'application/json';
      return Backbone.sync(method, model, options);
    }
  });

  NS.ContentItemCollection = Backbone.Collection.extend({
    url: '/api/items/',
    model: NS.ContentItemModel,
    comparator: function(a, b) {
      var aDate = a.get('source_posted_at'),
          bDate = b.get('source_posted_at');
      if (aDate < bDate) {
        return 1;
      } else if (bDate < aDate) {
        return -1;
      }
      return 0;
    }
  });

  NS.NeighborhoodCategoryCollection = NS.ContentItemCollection.extend({
    initialize: function(options) {
      this.neighborhood = options.neighborhood;
      this.category = options.category;
    },
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      options.data = options.data || {};
      _.extend(options.data, {category: this.category, tag: this.neighborhood});

      return NS.NeighborhoodCategoryCollection.__super__.fetch.call(this, options);
    }
  });

  NS.NeighborhoodModel = Backbone.Model.extend({
    collections: {
      event: null,
      resource: null,
      story: null
    },

    initContentCollections: function() {
      if (!this.collections.event) {
        this.collections.event = new NS.NeighborhoodCategoryCollection({
          category: 'Event',
          neighborhood: this.get('tag')
        });
        this.collections.event.fetch();
      }

      if (!this.collections.resource) {
        this.collections.resource = new NS.NeighborhoodCategoryCollection({
          category: 'Resource',
          neighborhood: this.get('tag')
        });
        this.collections.resource.fetch();
      }

      if (!this.collections.story) {
        this.collections.story = new NS.NeighborhoodCategoryCollection({
          category: 'Story',
          neighborhood: this.get('tag')
        });
        this.collections.story.fetch();
      }
    }
  });

  NS.NeighborhoodCollection = Backbone.Collection.extend({
    model: NS.NeighborhoodModel
  });





}(Alexander));