var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  "use strict";

  NS.Utils = _.extend(NS.Utils || {}, {
    getCurrentPath: function() {
      var root = Backbone.history.root,
          fragment = Backbone.history.fragment;
      return root + fragment;
    },

    getLoginUrl: function(options) {
      options = options || {};
      if (!options.redirect) {
        options.redirect = NS.Utils.getCurrentPath();
      }

      return NS.bootstrapped.baseUrl + 'login/' +
        (options.service ? options.service + '/' : '') +
        '?next=' + options.redirect;
    }
  });
})(MyPhillyRising);