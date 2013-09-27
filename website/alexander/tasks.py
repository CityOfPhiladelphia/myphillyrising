from celery import task, group
from alexander.models import Feed, ContentItem

from django.conf import settings
from geopy.geocoders.googlev3 import GTooManyQueriesError

import logging

logger = logging.getLogger(__name__)


@task
def refresh_feeds(feed_ids=None, individually=False):
    if feed_ids is None:
        feed_ids = [feed.id for feed in Feed.objects.all()]

    if individually:
        # When run with individually set to True, each feed is updated in its
        # own subtask (s). This will prevent things like
        tasks = [refresh_feed.s(feed_id) for feed_id in feed_ids]
        group(tasks).apply_async()
    else:
        feeds = Feed.objects.filter(pk__in=feed_ids)
        feeds.refresh()


@task
def refresh_feed(feed_id):
    """
    Resync the data from the feed identified by feed_id.
    """
    feed = Feed.objects.get(pk=feed_id)
    items = feed.refresh()

    geocode_contentitems(
        (item.pk for (item, has_changed) in items if has_changed), 
        retry_delay=86400
    )


@task(ignore_result=True)
def geocode_contentitems(item_ids, retry_delay=None):
    items = ContentItem.objects.filter(pk__in=item_ids).select_related('feed')
    for item in items:
        logger.info('Scheduling geocode for item in "%s" from "%s": "%s"' % (item.category, item.feed.title, item.title))
        geocode_contentitem.delay(item.id, retry_delay)


@task(ignore_result=True, max_retries=5, rate_limit="1/m")  # i.e., 1 request/minute
def geocode_contentitem(item_id, retry_delay=None):
    try:
        item = ContentItem.objects.get(pk=item_id)
        item.geocode()

    except GTooManyQueriesError as e:
        logger.warn('Geocoding rate limited... try again later!')
        if retry_delay is None:
            raise
        else:
            logger.info('Rescheduling geocode for item in "%s" from "%s": "%s"' % (item.category, item.feed.title, item.title))
            geocode_contentitem.retry(exc=e, countdown=retry_delay)

    except ContentItem.DoesNotExist as e:
        logger.warn(('Cannot geocode content item %s. '
                     'Content item no longer exists: %s') % (item_id, e,))
        raise
