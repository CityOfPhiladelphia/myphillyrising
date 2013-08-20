from celery import task, group
from alexander.models import Feed

from django.conf import settings
from geopy import geocoders

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
def geocode_contentitem(item, address):
    geocoder = geocoders.GoogleV3()
    try:
        # raise Exception
        results = geocoder.geocode(
            address,
            bounds=settings.GEOCODER['bounds'],
            region=settings.GEOCODER['region'],
            exactly_one=False
        )

        if (len(results) > 0):
            place, (item.lat, item.lng) = results[0]
            item.save()
    except geocoders.GTooManyQueriesError:
        # Rate limited... try again later!
        logger.warn('Rate limited... try again later!')
        # TODO Can I call myself?
        geocode_contentitem.apply_async(args=(item, address), countdown=86400)
