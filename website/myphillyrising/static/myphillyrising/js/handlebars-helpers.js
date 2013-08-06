/*globals Handlebars moment */
var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  Handlebars.registerHelper('is_authenticated', function(options) {
    return (NS.app.currentUser.isAuthenticated()) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('is_current_neighborhood', function(options) {
    return (this.tag === NS.app.currentNeighborhood) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('each_neighborhood', function(options) {
    var result;

    if (NS.app.neighborhoodCollection.length > 0) {
      result = '';
      NS.app.neighborhoodCollection.each(function(neighborhood) {
        result += options.fn(_.extend({}, this, neighborhood.toJSON()));
      });
    } else {
      result = options.inverse(this);
    }

    return result;
  });

  Handlebars.registerHelper('current_neighborhood', function() {
    return NS.app && NS.app.currentNeighborhood ? NS.app.currentNeighborhood : '';
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

  Handlebars.registerHelper('fromnow', function(datetime) {
    if (datetime) {
      return moment(datetime).fromNow();
    }
    return '';
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
}(MyPhillyRising));