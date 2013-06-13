/*globals Handlebars moment */

Handlebars.registerHelper('fromnow', function(datetime) {
  var datetime = this[datetimeAttr];
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
  return this.source_content.content[0].value;
});