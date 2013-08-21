from celery import task, group
from alexander.models import Feed, ContentItem

from django.conf import settings
from geopy import geocoders
from geopy.geocoders.googlev3 import GTooManyQueriesError

import logging

logger = logging.getLogger(__name__)


@task
def refresh_feeds(feed_ids, individually=False):
    if individually:
        # When run with individually set to True, each feed is updated in its
        # own subtask (s). This will prevent things like
        tasks = [refresh_feed.s(feed_id) for feed_id in feed_ids]
        group(tasks)
    else:
        feeds = Feed.objects.filter(pk__in=feed_ids)
        feeds.refresh()


@task
def refresh_feed(feed_id):
    feed = Feed.objects.get(pk=feed_id)
    feed.refresh()


@task
def geocode_contentitem(item_id, address, retry_delay=None):
    geocoder = geocoders.GoogleV3()
    try:
        # The geocode method may raise an exception. See
        # https://github.com/geopy/geopy/blob/master/geopy/geocoders/googlev3.py#L193
        # for possibilities.
        results = geocoder.geocode(
            address,
            bounds=settings.GEOCODER['BOUNDS'],
            region=settings.GEOCODER['REGION'],
            exactly_one=False
        )

    except GTooManyQueriesError as e:
        logger.warn('Rate limited... try again later!')
        if retry_delay is None:
            raise
        else:
            geocode_contentitem.retry(exc=e, countdown=retry_delay)

    if (len(results) > 0):
        item = ContentItem.objects.get(pk=item_id)
        place, (item.lat, item.lng) = results[0]
        item.save()
