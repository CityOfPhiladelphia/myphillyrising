/*globals Handlebars moment _ $ */
var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
    function getTweetText (text) {
    var url = window.location.toString(),
        urlLength = NS.twitterConf.short_url_length,
        len = 140 - urlLength - 1;
    return NS.Utils.truncateChars(text, len);
  }

  function eachInCollectionHelper(collection, options) {
    var result;

    if (collection.length > 0) {
      result = '';
      collection.each(function(model) {
        result += options.fn(_.extend({}, this, model.toJSON()));
      });
    } else {
      result = options.inverse(this);
    }

    return result;
  }

  function eachInArrayHelper(arr, options) {
    var result;

    if (arr.length > 0) {
      result = '';
      _.each(arr, function(elem) {
        result += options.fn(_.extend({}, this, elem));
      });
    } else {
      result = options.inverse(this);
    }

    return result;
  }

  function ifHelper(condition, options) {
    return condition ? options.fn(this) : options.inverse(this);
  }

  Handlebars.registerHelper('uriencode', function(s) {
    return encodeURIComponent(s);
  });

  Handlebars.registerHelper('is_authenticated', function(options) {
    return (NS.app.currentUser.isAuthenticated()) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('is_current_neighborhood', function(options) {
    return (this.tag === NS.app.currentNeighborhood) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('each_neighborhood', function(options) {
    return eachInCollectionHelper.call(this, NS.app.neighborhoodCollection, options);
  });

  Handlebars.registerHelper('current_neighborhood', function() {
    return NS.app && NS.app.currentNeighborhood ? NS.app.currentNeighborhood : '';
  });

  Handlebars.registerHelper('current_user', function(attr) {
    return (NS.app && NS.app.currentUser ? NS.app.currentUser.get(attr) : undefined);
  });

  Handlebars.registerHelper('current_user_profile', function(attr) {
    return (NS.app && NS.app.currentUser ? NS.app.currentUser.get('profile')[attr] : undefined);
  });

  Handlebars.registerHelper('window_location', function() {
    return window.location.toString();
  });

  Handlebars.registerHelper('login_url_for', function(service) {
    return NS.Utils.getLoginUrl({service: service});
  });

  Handlebars.registerHelper('logout_url', function() {
    return NS.bootstrapped.baseUrl + 'logout/';
  });

  Handlebars.registerHelper('STATIC_URL', function() {
    return NS.bootstrapped.staticUrl;
  });

  Handlebars.registerHelper('uriencoded_static_url', function() {
    return encodeURIComponent(NS.bootstrapped.staticUrl);
  });

  Handlebars.registerHelper('base_url', function() {
    return NS.bootstrapped.baseUrl;
  });

  Handlebars.registerHelper('csrf_token', function(options) {
    return '<input type="hidden" name="csrfmiddlewaretoken" value="' + NS.Utils.getCookie('csrftoken') + '">';
  });

  Handlebars.registerHelper('uriencoded_base_url', function() {
    return encodeURIComponent(NS.bootstrapped.baseUrl);
  });

  Handlebars.registerHelper('host_name', function() {
    return NS.bootstrapped.hostName;
  });

  Handlebars.registerHelper('uriencoded_host_name', function() {
    return encodeURIComponent(NS.bootstrapped.hostName);
  });

  Handlebars.registerHelper('fromnow', function(datetime) {
    if (datetime) {
      return moment(datetime).fromNow();
    }
    return '';
  });

  Handlebars.registerHelper('formatdatetime', function(datetime, format) {
    if (datetime) {
      return moment(datetime).format(format);
    }
    return datetime;
  });

  Handlebars.registerHelper('prettydate', function(datetime) {
    if (datetime) {
      return moment(datetime).format('MMMM Do YYYY h:mma');
    }
    return '';
  });

  Handlebars.registerHelper('prettymonth', function(datetime) {
    if (datetime) {
      return moment(datetime).format('MMM');
    }
    return '';
  });

  Handlebars.registerHelper('prettyday', function(datetime) {
    if (datetime) {
      return moment(datetime).format('D');
    }
    return '';
  });

  Handlebars.registerHelper('prettyyear', function(datetime) {
    if (datetime) {
      return moment(datetime).format('YYYY');
    }
    return '';
  });

  Handlebars.registerHelper('prettytime', function(datetime) {
    if (datetime) {
      return moment(datetime).format('h:mma');
    }
    return '';
  });

  Handlebars.registerHelper('rsscontent', function() {
    return this.source_content && this.source_content.content[0].value;
  });

  Handlebars.registerHelper('select', function(value, options) {
    var $el = $('<div/>').html(options.fn(this)),
      selectValue = function(v) {
        $el.find('[value="'+v+'"]').attr({
          checked: 'checked',
          selected: 'selected'
        });
      };

    if (_.isArray(value)) {
      _.each(value, selectValue);
    } else {
      selectValue(value);
    }

    return $el.html();
  });
  Handlebars.registerHelper('truncatechars', NS.Utils.truncateChars);

  Handlebars.registerHelper('TWEET_TEXT', getTweetText);

  Handlebars.registerHelper('firstsentence', function(text) {
    var regex = /^.*?[\.!\?](?:\s|$)/,
        match;

    // Extract the text from html
    text = $('<div>' + text + '</div>').text();

    if (_.isString(text)) {
      match = regex.exec(text);
      if (match) {
        return match[0];
      }
    }
    return text;
  });

  function pluralize(number, single, plural) {
    return (number === 1) ? single : plural;
  }

  Handlebars.registerHelper('pluralize', pluralize);

  // ============================================================
  // Event-specific
  // --------------
  // The following helpers expect an event content item as the
  // operating context.
  //

  Handlebars.registerHelper('action_count', function(action_type) {
    // Assuming `this` represents a content item...
    var count = _.where(this.actions, {type: action_type}).length;
    return count.toString();
  });

  Handlebars.registerHelper('if_has_actions', function(action_type, options) {
    if(_.where(this.actions, {type: action_type}).length > 0) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('action_count_without_current_user', function(action_type, singular, plural) {
    // Assuming `this` represents a content item...
    var count = _.filter(this.actions, function(a) { return a['type'] === action_type && a['user']['id'] !== NS.app.currentUser.id; }).length;
    return count.toString() + ((singular || plural) ? ' ' + pluralize(count, singular, plural) : '');
  });

  Handlebars.registerHelper('action_count_pluralize', function(action_type, singular, plural) {
    var number = _.where(this.actions, {type: action_type}).length;
    return pluralize(number, singular, plural);
  });

  Handlebars.registerHelper('each_action', function(action_type, options) {
    // Assuming `this` represents a content item...
    var arr = _.where(this.actions, {type: action_type});
    return eachInArrayHelper.call(this, arr, options);
  });

  Handlebars.registerHelper('current_user_has_taken_action', function(action_type, item, options) {
    // `item` argument is optional
    if (_.isUndefined(options)) {
      // Assuming `this` represents a content item...
      options = item;
      item = this;
    }

    var user = NS.app.currentUser.toJSON(),
        cond = (_.filter(item.actions, function(a) { return a.type === action_type && a.user.username === user.username; }).length > 0);
    return ifHelper.call(this, cond, options);
  });

  Handlebars.registerHelper('has_taken_action', function(user, action_type, item, options) {
    // `item` argument is optional
    if (_.isUndefined(options)) {
      // Assuming `this` represents a content item...
      options = item;
      item = this;
    }

    var cond = (_.filter(item.actions, function(a) { return a.type === action_type && a.user.username === user.username; }).length > 0);
    return ifHelper.call(this, cond, options);
  });

  Handlebars.registerHelper('is_in_progress', function(options) {
    // Assuming `this` represents an event content item
    return ifHelper.call(this, A.Utils.Events.isInProgress(this), options);
  });

  Handlebars.registerHelper('is_upcoming', function(options) {
    // Assuming `this` represents an event content item
    return ifHelper.call(this, A.Utils.Events.isUpcoming(this), options);
  });

  Handlebars.registerHelper('has_passed', function(options) {
    // Assuming `this` represents an event content item
    return ifHelper.call(this, A.Utils.Events.hasPassed(this), options);
  });

}(MyPhillyRising, Alexander));
