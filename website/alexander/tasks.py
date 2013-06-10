from celery import task, group
from alexander.models import Feed
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
    