/*globals Backbone $ */

var Alexander = Alexander || {};

(function(NS) {
  // Views
  NS.OrderedCollectionView = Backbone.Marionette.CollectionView.extend({
    // https://github.com/marionettejs/backbone.marionette/wiki/Adding-support-for-sorted-collections
    // Inspired by the above link, but it doesn't work when you start with an
    // empty (or unsorted) list.
    appendHtml: function(collectionView, itemView, index){
      var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el,
          children = childrenContainer.children(),
          indices = childrenContainer.data('indices') || [],
          goHereIndex;
      // console.log(index, $(itemView.el).find('.feed-item-title').text());

      // console.log('before', indices);
      indices.push(index);
      indices.sort();
      // console.log('after', indices);
      goHereIndex = indices.indexOf(index);
      // console.log('at', goHereIndex);

      if(goHereIndex === 0) {
        childrenContainer.prepend(itemView.el);
        // console.log('prepend');
      } else {
        // console.log('insert after', childrenContainer.children().eq(goHereIndex-1).find('.feed-item-title').text());
        childrenContainer.children().eq(goHereIndex-1).after(itemView.el);
      }

      childrenContainer.data('indices', indices);
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