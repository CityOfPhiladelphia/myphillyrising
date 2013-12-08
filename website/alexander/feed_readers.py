from datetime import date
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.translation import ugettext as _
from django.utils.timezone import now, datetime, timedelta
from time import mktime
from urllib2 import urlopen
from HTMLParser import HTMLParser
from time import mktime
from collections import defaultdict
from itertools import chain
import json  # For dumping dictionary content to strings
import re


# Optional packages
try:
    from feedparser import parse as parserss  # For parsing RSS and ATOM
except ImportError:
    pass

try:
    import icalendar  # For parsing iCal feeds
except ImportError:
    pass

import logging
logger = logging.getLogger(__name__)


def read_url(url):
    req = urlopen(url)
    content = req.read()

    try:
        encoding = req.headers['content-type'].split('charset=')[-1]
    except (AttributeError, KeyError):
        encoding = 'utf-8'

    return unicode(content, encoding)


class FeedReader (object):
    """
    Generally FeedReader instances will be created by the get_feed_reader
    factory function.
    """
    def __init__(self, url):
        self.url = url

    def get_json_encoder_class(self):
        return DjangoJSONEncoder

    def __iter__(self):
        """
        Retrieve the feed information from the upstream source, and return an
        iterator over the individual items from that source.
        """
        raise NotImplementedError

    def get_item_id(self, item_data):
        """
        Given some upstream representation of an item's source, give the id of
        the item that is unique to the upstream source.
        """
        raise NotImplementedError

    def is_different(self, item, item_data):
        """
        Given an item and some source data, return whether they represent the
        same data.
        """
        item_data = self.prepare_item_content(item_data)
        content = json.dumps(item_data, cls=self.get_json_encoder_class(), sort_keys=True)
        return item.source_content != content

    def prepare_item_content(self, item_data):
        """
        Take raw item data and convert it into whatever should be stored in an
        item instance's content field.
        """
        raise NotImplementedError

    def get_occurrence_count(self, item_data):
        """
        Get the number of models that will correspond to the given source item
        data, and the dates between which that number of items occur. This will
        all be returned as a tuple of (count, start_date, end_date), where each
        of the dates can be None if they are unbounded or indeterminate.
        """
        raise NotImplementedError

    def update_items(self, items, item_data):
        """
        Save the given data into the item model(s).
        """
        raise NotImplementedError


class RSSFeedReader (FeedReader):
    def __iter__(self):
        msg = _('Retrieving items from RSS feed at %s.') % (self.url,)
        logger.info(msg)

        feed_data = parserss(self.url)
        if len(feed_data.entries) == 0:
            msg = _('The RSS feed at "%s" has no items in it. '
                    'Are you sure the address is right?') % (self.url,)
            logger.warn(msg)
        return iter(feed_data.entries)

    def get_item_id(self, item_data):
        try:
            return item_data['id']
        except KeyError:
            if isinstance(item_data, dict):
                pretty_item_data = json.dumps(item_data, indent=2)
            else:
                pretty_item_data = repr(item_data)

            msg = _('Source item has no id: %s') % (pretty_item_data,)
            raise ValueError(msg)

    def prepare_item_content(self, item_data):
        item_data = item_data.copy()
        item_data.pop('published_parsed', None)
        item_data.pop('updated_parsed', None)
        return item_data

    def get_occurrence_count(self, item_data):
        return 1, None, None

    def update_items(self, items, item_data):
        if len(items) > 1:
            raise ValueError('There should only ever be exactly one-to-one '
                             'relationships between items in RSS feeds.')
        item = items[0]

        published_at = item_data.pop('published_parsed', None)
        updated_at = item_data.pop('updated_parsed', None)

        item_data = self.prepare_item_content(item_data)

        h = HTMLParser()
        item.title = h.unescape(item_data['title'])
        item.displayed_from = datetime.fromtimestamp(mktime(published_at or updated_at))
        item.source_content = json.dumps(item_data, sort_keys=True)
        item.source_url = item_data.get('link') or item_data.get('id')
        item.source_id = item_data.get('id') or item_data.get('link')

        item.last_read_at = now()


class ICalJSONEncoder (DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, icalendar.prop.vDDDLists):
            return [self.default(elem.dt) for elem in obj.dts]
        elif isinstance(obj, icalendar.prop.vDDDTypes):
            return self.default(obj.dt)
        else:
            return super(ICalJSONEncoder, self).default(obj)


class ICalFeedReader (FeedReader):
    def __iter__(self):
        msg = _('Retrieving items from iCal feed at %s.') % (self.url,)
        logger.info(msg)

        try:
            raw_data = read_url(self.url)
        except URLError as e:
            msg = _('Could not read data from the iCal feed at "%s" -- %s. '
                    'Are you sure the address is right?') % (self.url, e)
            logger.warning(msg)
            return iter([])

        try:
            cal = icalendar.Calendar.from_ical(raw_data)
        except ValueError as e:
            msg = _('The iCal feed at "%s" is invalid -- %s. '
                    'Are you sure the address is right?') % (self.url, e)
            logger.warning(msg)
            return iter([])

        return iter([ev for ev in cal.walk() if ev.name.lower() == 'vevent'])

    def get_json_encoder_class(self):
        return ICalJSONEncoder

    def get_dt_or_none(self, vddd_type, default_tzinfo=None):
        if vddd_type is not None:
            if isinstance(vddd_type, (date, datetime)):
                return vddd_type
            else:
                dt = vddd_type.dt
                if hasattr(dt, 'tzinfo') and dt.tzinfo is None:
                    dt = dt.replace(tzinfo=default_tzinfo)
                return dt
        else:
            return None

    def get_dts_or_empty(self, vddd_lists, default_tzinfo):
        dts = []

        # If there's one EXDATE, it's a vDDDLists object
        if hasattr(vddd_lists, 'dts'):
            dts = [self.get_dt_or_none(dt, default_tzinfo=default_tzinfo)
                   for dt in vddd_lists.dts]

        # Otherwise, check if it's a list of vDDDLists objects
        elif all(hasattr(ed, 'dts') for ed in vddd_lists):
            multi = vddd_lists
            dts = [self.get_dt_or_none(dt, default_tzinfo=default_tzinfo)
                   for dt in chain(*[single.dts for single in multi])]

        # If it's neither of those, it may already be datetimes
        elif all(isinstance(dt, datetime) for dt in vddd_lists):
            dts = vddd_lists

        return dts

    def make_native_dts(self, item_data):
        item_data = item_data.copy()

        item_data['DTSTART'] = self.get_dt_or_none(item_data.pop('DTSTART', None))
        item_data['DTEND'] = self.get_dt_or_none(item_data.pop('DTEND', None))
        item_data['DTSTAMP'] = self.get_dt_or_none(item_data.pop('DTSTAMP', None))
        item_data['CREATED'] = self.get_dt_or_none(item_data.pop('CREATED', None))
        item_data['LAST-MODIFIED'] = self.get_dt_or_none(item_data.pop('LAST-MODIFIED', None))
        item_data['RECURRENCE-ID'] = self.get_dt_or_none(item_data.pop('RECURRENCE-ID', None))

        if isinstance(item_data['DTSTART'], datetime):  # it could be a date
            default_tzinfo = item_data['DTSTART'].tzinfo
        elif isinstance(item_data['DTEND'], datetime):
            default_tzinfo = item_data['DTEND'].tzinfo
        else:
            default_tzinfo = None

        item_data['EXDATE'] = self.get_dts_or_empty(item_data.pop('EXDATE', []),
                                                    default_tzinfo=default_tzinfo)
        item_data['RDATE'] = self.get_dts_or_empty(item_data.pop('RDATE', []),
                                                   default_tzinfo=default_tzinfo)

        return item_data

    def item_as_json(self, item_data, **kwargs):
        item_data = self.make_native_dts(item_data)
        return json.dumps(item_data, cls=self.get_json_encoder_class(), **kwargs)

    def get_item_id(self, item_data):
        try:
            if 'SEQUENCE' in item_data:
                return '%s:%s' % (item_data['UID'], item_data['SEQUENCE'])
            else:
                return str(item_data['UID'])
        except KeyError:
            if isinstance(item_data, dict):
                pretty_item_data = self.item_as_json(item_data, indent=2)
            else:
                pretty_item_data = repr(item_data)

            msg = _('Source item has no UID: %s') % (pretty_item_data,)
            raise ValueError(msg)

    def prepare_item_content(self, item_data):
        item_data = self.make_native_dts(item_data)
        item_data.pop('DTSTAMP')  # ...it always changes and we don't need it.
        return item_data

    @property
    def recurrence_ids(self):
        if not hasattr(self, '_recurrence_ids'):
            self._recurrence_ids = defaultdict(set)
        return self._recurrence_ids

    def get_dates(self, item_data):
        item_data = self.prepare_item_content(item_data)

        # Recurring event
        if 'RRULE' in item_data:
            from dateutil.rrule import rrulestr

            dates = []
            start_date = now()
            end_date = start_date + timedelta(days=30)

            rule = rrulestr(item_data['RRULE'].to_ical(),
                            dtstart=item_data['DTSTART'],
                            forceset=True)

            # Exclusions and inclusions...
            for date in item_data.get('EXDATE', []):
                rule.exdate(date)
            for date in item_data.get('RDATE', []):
                rule.rdate(date)

            for date in rule:
                if date < start_date:
                    continue
                elif date > end_date:
                    break
                else:
                    dates.append(date)

            return dates, start_date, end_date

        # Single instance of a recurring event
        elif item_data.get('RECURRENCE-ID', None) is not None:
            # Make a note that we've seen this recurrence id, so that the
            # corresponding rrule knows how many things there should be.
            self.recurrence_ids[self.get_item_id(item_data)].add(item_data['RECURRENCE-ID'])
            return [item_data['DTSTART']], item_data['DTSTART'], item_data['DTEND']

        # One-time event (single date)
        else:
            dates = [item_data['DTSTART']]
            return dates, None, None

    def get_occurrence_count(self, item_data):
        dates, start, end = self.get_dates(item_data)
        return len(dates), start, end

    def update_single_item(self, item, date, item_data):
        # vText objects are derived from unicode, so this conversion should be
        # trivial
        first_start = item_data['DTSTART']
        first_end = item_data.get('DTEND', None)

        item.title = unicode(item_data.get('SUMMARY'))
        item.displayed_from = date
        if first_start and first_end:
            item.displayed_until = date + (first_end - first_start)

        content = json.dumps(item_data, cls=self.get_json_encoder_class(), sort_keys=True)
        item.source_id = self.get_item_id(item_data)
        item.source_content = content

        item.source_url = self.url
        # TODO: Should we do something special with the LAST-MODIFIED date?

        if 'LOCATION' in item_data:
            # vText objects are derived from unicode, so this conversion
            # should be trivial
            item.address = unicode(item_data['LOCATION'])

        item.last_read_at = now()

    def update_items(self, items, item_data):
        item_data = self.prepare_item_content(item_data)
        item_id = self.get_item_id(item_data)
        dates, start, end = self.get_dates(item_data)

        if len(items) < len(dates):
            raise ValueError('Wrong number of events: expected %s, got %s' %
                             (len(dates), len(items)))

        # How many items do we need to get rid of?
        surplus_items = len(items) - len(dates)

        if len(dates) == 0:
            return

        elif len(items) == 1 and len(dates) == 1:
            self.update_single_item(items[0], dates[0], item_data)

        else:
            old_items = [item for item in items if item.pk is not None]
            new_items = [item for item in items if item.pk is None]

            # First deal with known dates
            for item in old_items:
                date = item.displayed_from

                if date in self.recurrence_ids[item_id]:
                    # If the start date of this event is in the recurrence_ids
                    # mapping for this source item it means we've already seen
                    # an event instance for the date.
                    #
                    # For more about RECURRENCE-IDs, see section 4.8.4.4 of
                    # http://www.ietf.org/rfc/rfc2445.txt:
                    #
                    #   The "RECURRENCE-ID" property is used in conjunction
                    #   with the "UID"and "SEQUENCE" property to identify a
                    #   particular instance of a recurring event, to-do or
                    #   journal.
                    dates.remove(date)
                elif date in dates:
                    self.update_single_item(item, date, item_data)
                    dates.remove(date)
                else:
                    item.delete()
                    if surplus_items <= 0:
                        new_items.append(item)
                    else:
                        surplus_items -= 1
                    continue

            # Then deal with new dates
            for item, date in zip(new_items, dates):
                self.update_single_item(item, date, item_data)


class FacebookPageReader (RSSFeedReader):

    def __iter__(self):
        orig_url = self.url

        page_url = self.url
        match = re.match('^https?://(?:www.)?facebook.com/(.+)$', page_url)
        if match:
            page_url = 'http://graph.facebook.com/' + match.group(1)

        # Get the page id
        page_info = json.loads(read_url(page_url))
        page_id = page_info['id']

        # Temporarily set self.url to the RSS feed for the page
        self.url = 'https://www.facebook.com/feeds/page.php?format=rss20&id=%s' % (page_id,)
        feed_iter = super(FacebookPageReader, self).__iter__()

        # Restore the URL and return the iter
        self.url = orig_url
        return feed_iter

    def get_item_id(self, item_data):
        match = re.match('^https?://(?:www.)?facebook.com/feeds/(www.facebook.com/.+)$', item_data['id'])
        if match:
            item_data['id'] = 'http://%s' % (match.group(1),)

        return super(FacebookPageReader, self).get_item_id(item_data)


def get_feed_reader(source_type, **source_kwargs):
    """
    Given a source type and arguments, construct an appropriate feed reader.
    """
    if source_type.lower() == 'rss':
        source_url = source_kwargs.get('url')
        return RSSFeedReader(source_url)
    elif source_type.lower() in ('ical', 'ics'):
        source_url = source_kwargs.get('url')
        return ICalFeedReader(source_url)
    elif source_type.lower() == 'facebook':
        source_url = source_kwargs.get('url')
        return FacebookPageReader(source_url)
    else:
        msg = _('Unrecognized feed source type: %r') % (source_type,)
        raise ValueError(msg)
