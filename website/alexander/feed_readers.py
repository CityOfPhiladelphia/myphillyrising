from django.core.serializers.json import DjangoJSONEncoder
from django.utils.translation import ugettext as _
from django.utils.timezone import now, datetime
from time import mktime
from urllib2 import urlopen
import json  # For dumping dictionary content to strings

# Optional packages
try:
    import feedparser  # For parsing RSS and ATOM
except ImportError:
    pass

try:
    import icalendar  # For parsing iCal feeds
except ImportError:
    pass

import logging
logger = logging.getLogger(__name__)


class FeedReader (object):
    def __init__(self, url):
        self.url = url


class RSSFeedReader (FeedReader):
    def __iter__(self):
        msg = _('Retrieving items from RSS feed at %s.') % (self.url,)
        logger.info(msg)

        feed_data = feedparser.parse(self.url)
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

    def update_item_if_changed(self, item, item_data):
        has_changed = False

        title = item_data['title']
        if item.title != title:
            item.title = title
            has_changed = True

        item_data = item_data.copy()
        published_at = item_data.pop('published_parsed', None)
        updated_at = item_data.pop('updated_parsed', None)
        content = json.dumps(item_data, sort_keys=True)
        if item.source_content != content:
            item.source_content = content
            has_changed = True

        if has_changed:
            item.source_url = item_data['id']
            item.source_posted_at = datetime.fromtimestamp(mktime(published_at or updated_at))
            item.last_read_at = now()
            item.save()


class ICalFeedReader (FeedReader):
    def __iter__(self):
        msg = _('Retrieving items from iCal feed at %s.') % (self.url,)
        logger.info(msg)

        try:
            raw_data = urlopen(self.url).read()
        except URLError as e:
            msg = _('Could not read data from the iCal feed at "%s" -- %s. '
                    'Are you sure the address is right?') % (self.url, e)
            logger.error(msg)
            return iter([])

        try:
            cal = icalendar.Calendar.from_ical(raw_data)
        except ValueError as e:
            msg = _('The iCal feed at "%s" is invalid -- %s. '
                    'Are you sure the address is right?') % (self.url, e)
            logger.error(msg)
            return iter([])

        return iter([ev for ev in cal.walk() if ev.name.lower() == 'vevent'])

    def make_native_dts(self, item_data):
        item_data = item_data.copy()

        def get_dt_or_none(vddd_type):
            if vddd_type is not None:
                if isinstance(vddd_type, datetime):
                    return vddd_type
                else:
                    return vddd_type.dt
            else:
                return None
        
        item_data['DTSTART'] = get_dt_or_none(item_data.pop('DTSTART', None))
        item_data['DTEND'] = get_dt_or_none(item_data.pop('DTEND', None))
        item_data['DTSTAMP'] = get_dt_or_none(item_data.pop('DTSTAMP', None))
        item_data['CREATED'] = get_dt_or_none(item_data.pop('DTSTAMP', None))
        item_data['LAST-MODIFIED'] = get_dt_or_none(item_data.pop('LAST-MODIFIED', None))

        return item_data

    def item_as_json(self, item_data, **kwargs):
        item_data = self.make_native_dts(item_data)
        return json.dumps(item_data, cls=DjangoJSONEncoder, **kwargs)

    def get_item_id(self, item_data):
        try:
            return str(item_data['UID'])
        except KeyError:
            if isinstance(item_data, dict):
                pretty_item_data = self.item_as_json(item_data, indent=2)
            else:
                pretty_item_data = repr(item_data)

            msg = _('Source item has no UID: %s') % (pretty_item_data,)
            raise ValueError(msg)

    def update_item_if_changed(self, item, item_data, commit=True):
        has_changed = False
        item_data = self.make_native_dts(item_data)

        title = item_data.get('SUMMARY')
        if item.title != title:
            item.title = title
            has_changed = True

        item_data.pop('DTSTAMP')  # ...it always changes and we don't need it.
        content = json.dumps(item_data, cls=DjangoJSONEncoder, sort_keys=True)
        if item.source_content != content:
            item.source_content = content
            has_changed = True

        if has_changed:
            item.source_url = self.url
            # TODO: Should the published_at time be DTSTART or LAST-MODIFIED?
            item.source_posted_at = item_data.get('DTSTART', None)
            item.last_read_at = now()

            if commit:
                item.save()


def get_feed_reader(source_type, **source_kwargs):
    """
    Given a source type and arguments, construct an appropriate feed reader.
    """
    source_type = source_type.lower()
    if source_type == 'rss':
        source_url = source_kwargs.get('url')
        return RSSFeedReader(source_url)
    elif source_type == 'ical':
        source_url = source_kwargs.get('url')
        return ICalFeedReader(source_url)
    else:
        msg = _('Unrecognized feed source type: %r') % (source_type,)
        raise ValueError(msg)


