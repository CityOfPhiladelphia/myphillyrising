/*globals Handlebars moment */

Handlebars.registerHelper('fromnow', function(datetimeAttr) {
  var datetime = this[datetimeAttr];
  if (datetime) {
    return moment(datetime).fromNow();
  }
  return '';
});

Handlebars.registerHelper('prettydate', function(datetimeAttr) {
  var datetime = this[datetimeAttr];
  if (datetime) {
    return moment(datetime).format('MMMM Do YYYY h:mma');
  }
  return '';
});