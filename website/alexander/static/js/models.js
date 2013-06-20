/*globals Backbone $ */

var Alexander = Alexander || {};

(function(NS) {
  // Models and Collections
  NS.FilteredCollection = function(original){
    var filtered = new original.constructor();

    // allow this object to have it's own events
    filtered._callbacks = {};

    // call 'where' on the original function so that
    // filtering will happen from the complete collection
    filtered.filter = function(criteria){
        var items;

        // call 'where' if we have criteria
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
    comparator: 'source_posted_at'
  });
}(Alexander));