/*globals Handlebars moment */

Handlebars.registerHelper('fromnow', function(datetimeAttr) {
  return moment(this[datetimeAttr]).fromNow();
});

Handlebars.registerHelper('prettydate', function(datetimeAttr) {
  return moment(this[datetimeAttr]).format('MMMM Do YYYY h:mma');
});