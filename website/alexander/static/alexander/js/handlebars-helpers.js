/*globals Handlebars moment _ $ */
var MyPhillyRising = MyPhillyRising || {};

(function(NS) {

  Handlebars.registerHelper('is_pending', function(status, options) {
    if (status === 'pending') {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('is_published', function(status, options) {
    if (status === 'published') {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('is_discarded', function(status, options) {
    if (status === 'discarded') {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
}(Alexander));
