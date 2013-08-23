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
    },

    truncateChars: function(text, maxLength, continuationString) {
      if (_.isUndefined(continuationString) || !_.isString(continuationString)) {
        continuationString = '...';
      }

      if (text && text.length > maxLength) {
        return text.slice(0, maxLength - continuationString.length) + continuationString;
      } else {
        return text;
      }
    },

    unescapeHtml: function(escapedText) {
      var e = document.createElement('div');
      e.innerHTML = escapedText;
      return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    },

    getCookie: function(name) {
      var cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    },

    // ====================================================
    // Analytics

    log: function() {
      if (window.ga) {
        window.ga.apply(window, arguments);
      } else if (window.console.log) {
        window.console.log(Array.prototype.slice.call(arguments, 0));
      }
    },

  });
})(MyPhillyRising);