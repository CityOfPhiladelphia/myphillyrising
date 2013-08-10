/*globals Backbone $ _ */

var Alexander = Alexander || {};

(function(NS) {
  Backbone.Relational.store.addModelScope(NS);

  NS.AgsCollection = Backbone.Collection.extend({
    parse: function(response) {
      return response.features;
    }
  });

  NS.FacilitiesCollection = Backbone.Collection.extend({
    initialize: function(models, options) {
      var self = this;

      this.config = options.config;
      // Keep track of all of our AGS services
      this.allTheCollections = [];

      // Turn our config file into collections
      _.each(this.config, function(f, i) {

        // Make and cache a collection
        self.allTheCollections[i] = new NS.AgsCollection(null, {
          url: f.url
        });

        // When we reset this collection
        self.allTheCollections[i].on('reset', function(collection, evt) {

          // Go through each model
          collection.each(function(model) {
            var geom = model.get('geometry'),
                attrs = model.get('attributes'),
                normAttrs = {
                  label: f.label,
                  type: f.type,
                  geom: geom
                };

            _.each(f.attrMap, function(val, key) {
              normAttrs[key] = attrs[val];
            });

            // Add it to the list item collection so the view can do its thing.
            // Also map our attributes to something the template will understand.
            self.add(normAttrs);
          });
        });
      });
    },
    fetch: function(options) {
      var self = this;

      // Get new data for all of the AGS collections, triggering a reset!
      _.each(this.allTheCollections, function(collection, i) {
        collection.fetch({
          reset: true,
          data: {
            where: '1=1',
            outFields: '*',
            inSR: '4326',
            outSR: '4326',
            spatialRel: 'esriSpatialRelIntersects', // Find stuff that intersects this envelope
            geometryType: 'esriGeometryEnvelope', // Our "geometry" url param will be an envelope
            geometry: self.pointToBoundingBox(options.center, 0.75).join(','), // Build envelope geometry
            f: 'json'
          }
        });
      });

    },
    pointToBoundingBox: function(coords, radius) {
      var lngMile = 0.0192,
          latMile = 0.01499,
          bottom = coords[0] - (latMile * radius),
          top = coords[0] + (latMile * radius),
          left = coords[1] - (lngMile * radius),
          right = coords[1] + (lngMile * radius);

      return [left, bottom, right, top]; // <xmin>,<ymin>,<xmax>,<ymax>
    }
  });

  NS.PaginatedCollection = Backbone.Collection.extend({
    parse: function(response) {
      this.totalLength = response.count;
      this.nextPage = response.next;
      return response.results;
    },

    fetchNextPage: function(success, error) {
      var collection = this,
          nextUrl;

      if (this.nextPage) {
        nextUrl = function() { return collection.nextPage; };

        NS.Utils.patch(this, {url: nextUrl}, function() {
          collection.fetch({
            remove: false,
            success: success,
            error: error
          });
        });
      }
    }
  });

  // Models and Collections
  NS.FeedModel = Backbone.Model.extend({
    refresh: function() {
      $.ajax({
        url: this.url() + '/refresh/',
        type: 'PUT'
      });
    }
  });

  NS.FeedCollection = Backbone.Collection.extend({
    url: '/api/feeds',
    model: NS.FeedModel,
    comparator: 'title'
  });

  NS.ActionModel = Backbone.RelationalModel.extend({
    urlRoot: '/api/actions'
  });

  NS.ActionsCollection = NS.PaginatedCollection.extend({
    url: '/api/actions',
    model: NS.ActionModel
  });

  NS.ContentItemModel = Backbone.RelationalModel.extend({
    relations: [{
      type: Backbone.HasMany,
      key: 'actions',
      relatedModel: 'ActionModel',
      collectionType: 'ActionsCollection',
      reverseRelation: {
        key: 'item',
        includeInJSON: Backbone.Model.prototype.idAttribute
      }
    }],
    urlRoot: '/api/items',
    parse: function(resp, options) {
      if (_.isString(resp.source_content)) {
        resp.source_content = JSON.parse(resp.source_content);
      }
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

  NS.ContentItemCollection = NS.PaginatedCollection.extend({
    url: '/api/items',
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
    initialize: function(data, options) {
      this.neighborhood = options.neighborhood;
      this.category = options.category;

      this.on('sync', function() {
        this.isSynced = true;
      }, this);
    },
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      options.data = options.data || {};
      _.extend(options.data, {category: this.category, tag: this.neighborhood});

      return NS.NeighborhoodCategoryCollection.__super__.fetch.call(this, options);
    }
  });
}(Alexander));