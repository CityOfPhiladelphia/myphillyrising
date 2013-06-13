/*globals Handlebars moment */

Handlebars.registerHelper('fromnow', function(datetimeAttr) {
  return moment(this[datetimeAttr]).fromNow();
});

Handlebars.registerHelper('prettydate', function(datetimeAttr) {
  return moment(this[datetimeAttr]).format('MMMM Do YYYY h:mma');
});

Handlebars.registerHelper('prettymonth', function(datetimeAttr) {
  return moment(this[datetimeAttr]).format('MMM');
});

Handlebars.registerHelper('prettyday', function(datetimeAttr) {
  return moment(this[datetimeAttr]).format('D');
});

Handlebars.registerHelper('prettyyear', function(datetimeAttr) {
  return moment(this[datetimeAttr]).format('YYYY');
});

Handlebars.registerHelper('prettytime', function(datetimeAttr) {
  return moment(this[datetimeAttr]).format('h:mma');
});