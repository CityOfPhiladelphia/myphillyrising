from django.utils.translation import ugettext as _
from django.utils.timezone import now, datetime
from time import mktime

# Optional packages
try:
    import feedparser  # For parsing RSS and ATOM
    import json  # For dumping dictionary content to strings
except ImportError:
    pass

import logging
logger = logging.getLogger(__name__)


class FeedReader (object):
    pass


class RSSFeedReader (FeedReader):
    def __init__(self, url):
        self.url = url

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


def get_feed_reader(source_type, **source_kwargs):
    """
    Given a source type and arguments, construct an appropriate feed reader.
    """
    if source_type == 'rss':
        source_url = source_kwargs.get('url')
        return RSSFeedReader(source_url)
    else:
        msg = _('Unrecognized feed source type: %r') % (source_type,)
        raise ValueError(msg)


