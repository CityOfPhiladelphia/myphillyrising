/*globals jQuery _ Backbone */

var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  "use strict";

  // Array indexOf Polyfill
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FindexOf
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
      'use strict';
      if (this == null) {
        throw new TypeError();
      }
      var n, k, t = Object(this),
          len = t.length >>> 0;

      if (len === 0) {
        return -1;
      }
      n = 0;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n != n) { // shortcut for verifying if it's NaN
          n = 0;
        } else if (n != 0 && n != Infinity && n != -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };
  }

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
      } else if (window.console) {
        window.console.log(Array.prototype.slice.call(arguments, 0));
      }
    }

  });
}(MyPhillyRising));