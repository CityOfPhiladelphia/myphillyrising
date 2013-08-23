/*globals _, Backbone, Alexander */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {

  NS.UserModel = Backbone.Model.extend({
    isAuthenticated: function() {
      return !this.isNew();
    },
    hasSignedIn: function() {
      var dateJoined = new Date(this.get('date_joined')),
          points = this.get('points'),
          now = new Date(),
          thirtyDaysInMillis = 2592000000;

      if (!points && (now - dateJoined <= thirtyDaysInMillis)) {
        return false;
      }

      return true;
    },
    onAction: function(model, options) {
      var points = this.get('points');
      this.set('points', points + model.get('points'));

      this.trigger('action', model, options);
    },
    doAction: function(actionObj, contentItem, options) {
      var self = this,
          actionModel;

      if (this.isNew()) {
        return;
      }

      _.extend(actionObj, {
        user: this.id,
        item: contentItem ? contentItem.id : null
      });

      if (contentItem) {
        contentItem.get('actions').create(actionObj, {
          success: _.bind(function(model) {
            self.onAction(model, options);
          }, this)
        });
      } else {
        actionModel = new A.ActionModel(actionObj);
        actionModel.save(null, {
          success: _.bind(function(model) {
            self.onAction(model, options);
          }, this)
        });
      }
    }
  });

  NS.UserCollection = A.PaginatedCollection.extend({
    url: '/api/users',
    model: NS.UserModel,
    initialize: function(data, options) {
      this.neighborhood = options.neighborhood;

      this.on('sync', function() {
        this.isSynced = true;
      }, this);
    },
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      options.data = options.data || {};
      _.extend(options.data, {neighborhood: this.neighborhood});

      return NS.UserCollection.__super__.fetch.call(this, options);
    }
  });

  NS.NeighborhoodModel = Backbone.Model.extend({
    initialize: function() {
      this.collections = {
        events: new A.NeighborhoodCategoryCollection([], {
          category: 'events',
          neighborhood: this.get('tag'),
          comparator: function(a, b) {
            if (a.get('is_featured') && !b.get('is_featured')) {
              return -1;
            } else if (!a.get('is_featured') && b.get('is_featured')) {
              return 1;
            }

            if (a.get('source_posted_at') < b.get('source_posted_at')) {
              return -1;
            } else {
              return 1;
            }
          }
        }),

        resources: new A.NeighborhoodCategoryCollection([], {
          category: 'resources',
          neighborhood: this.get('tag'),
          comparator: function(a, b) {
            if (a.get('is_featured') && !b.get('is_featured')) {
              return -1;
            } else if (!a.get('is_featured') && b.get('is_featured')) {
              return 1;
            }

            if (a.get('title') < b.get('title')) {
              return -1;
            } else {
              return 1;
            }
          }
        }),

        stories: new A.NeighborhoodCategoryCollection([], {
          category: 'stories',
          neighborhood: this.get('tag'),
          comparator: function(a, b) {
            if (a.get('is_featured') && !b.get('is_featured')) {
              return -1;
            } else if (!a.get('is_featured') && b.get('is_featured')) {
              return 1;
            }

            if (a.get('source_posted_at') < b.get('source_posted_at')) {
              return 1;
            } else {
              return -1;
            }
          }
        }),

        users: new NS.UserCollection([], {
          neighborhood: this.get('tag')
        })
      };
    },

    fetchCollectionData: function() {
      if (!this.collections.users.isSynced) {
        this.collections.users.fetch({
          reset: true
        });
      }

      if (!this.collections.events.isSynced) {
        this.collections.events.fetch({
          reset: true
        });
      }

      if (!this.collections.resources.isSynced) {
        this.collections.resources.fetch({
          reset: true
        });
      }

      if (!this.collections.stories.isSynced) {
        this.collections.stories.fetch({
          reset: true
        });
      }
    }
  });

  NS.NeighborhoodCollection = Backbone.Collection.extend({
    model: NS.NeighborhoodModel
  });

}(MyPhillyRising, Alexander));