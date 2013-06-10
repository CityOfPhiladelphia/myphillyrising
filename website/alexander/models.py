from django.db import models
from django.db.models import query
from django.utils.translation import ugettext as _
from django.utils.timezone import now
from .feed_readers import get_feed_reader

import logging
logger = logging.getLogger(__name__)


class FeedQuerySet (query.QuerySet):
    def refresh(self):
        for feed in self:
            feed.refresh()


class FeedManager (models.Manager):
    def get_query_set(self):
        return FeedQuerySet(self.model, using=self._db)

    def refresh(self):
        return self.all().refresh()


class Feed (models.Model):
    title = models.CharField(max_length=100)
    last_read_at = models.DateTimeField(null=True, blank=True)
    # ----------
    # Information about the original feed
    source_url = models.URLField()
    source_type = models.CharField(max_length=20)
    # ----------
    # Defaults for the content items retrieved from this feed
    default_category = models.CharField(max_length=20)

    objects = FeedManager()

    def __unicode__(self):
        return self.title

    def refresh(self):
        """
        Update a feed instance from its source URL if there have been any 
        changes to the feed's items.
        """
        feed_source = get_feed_reader(self.source_type, url=self.source_url)
        for item_source in feed_source:
            source_id = feed_source.get_item_id(item_source)
            # TODO: We could probably get all the source ids all at once,
            #       cutting down on the glut of queries we have to do.
            # TODO: Think about what to do when there are multiple content 
            #       items that refer to the same source item (e.g., repeating
            #       calendar events).
            try:
                item = self.items.get(source_id=source_id)
            except ContentItem.DoesNotExist:
                item = ContentItem(feed=self, source_id=source_id)
            feed_source.update_item_if_changed(item, item_source)
        self.last_read_at = now()
        self.save()


class ContentItem (models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=160, null=True)
    tags = models.ManyToManyField('ContentTag')

    # Information about the original source content
    feed = models.ForeignKey('Feed', related_name='items')
    source_id = models.CharField(max_length=1000)
    source_url = models.URLField()
    source_posted_at = models.DateTimeField()
    source_content = models.TextField()

    def __unicode__(self):
        return self.title or self.source_url


class ContentTag (models.Model):
    label = models.CharField(max_length=100)

    def __unicode__(self):
        return self.label
