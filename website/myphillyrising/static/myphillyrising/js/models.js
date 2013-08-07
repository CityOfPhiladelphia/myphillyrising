/*globals _, Backbone, Alexander */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {

  NS.UserModel = Backbone.Model.extend({
    isAuthenticated: function() {
      return !this.isNew();
    },
    onAction: function(resp) {
      console.log('onAction', arguments);
      var points = this.get('points');
      // this.set('points', points += resp.points);
    },
    doAction: function(actionObj, contentItem) {
      var self = this,
          actionModel;

      if (contentItem) {
        contentItem.get('actions').create(actionObj, {
          success: self.onAction
        });
      } else {
        actionModel = new A.ActivityModel(actionObj);
        actionModel.save({
          success: self.onAction
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
          neighborhood: this.get('tag')
        }),

        resources: new A.NeighborhoodCategoryCollection([], {
          category: 'resources',
          neighborhood: this.get('tag')
        }),

        stories: new A.NeighborhoodCategoryCollection([], {
          category: 'stories',
          neighborhood: this.get('tag')
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