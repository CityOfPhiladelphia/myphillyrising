/*globals Backbone $ */

var Alexander = Alexander || {};

(function(NS) {
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
    url: '/api/feeds/',
    model: NS.FeedModel
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
    model: NS.ContentItemModel
  });
}(Alexander));