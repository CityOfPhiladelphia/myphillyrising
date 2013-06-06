from django.db import models
from django.utils.translation import ugettext as _


class FeedManager (models.Manager):
    def update_from_source(self, ids):
        feeds = self.all()
        if ids:
            feeds.filter(pk__in=ids)

        for feed in feeds:
            feed.fetch_from_source()


class Feed (models.Model):
    title = models.CharField(max_length=100)
    last_read_at = models.DateTimeField(null=True)

    # Information about the original feed
    source_url = models.URLField()
    source_type = models.CharField(max_length=20)

    # Defaults for the content items retrieved from this feed
    default_category = models.CharField(max_length=20)

    def __unicode__(self):
        self.title

    def fetch_from_source(self):
        pass


class ContentItem (models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=160, null=True)
    tags = models.ManyToManyField('ContentTag')

    # Information about the original source content
    source_feed = models.ForeignKey('Feed')
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
