from django.conf import settings
from django.db import models
from django.db.models import query
from django.utils.translation import ugettext as _
from django.utils.timezone import now
from geopy import geocoders
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
    default_tags = models.ManyToManyField('ContentTag', blank=True)

    objects = FeedManager()

    def __unicode__(self):
        return self.title

    def get_item(self, **kwargs):
        try:
            return self.items.get(**kwargs)
        except ContentItem.DoesNotExist:
            item = ContentItem(feed=self, category=self.default_category, **kwargs)
            # Patch item.save to add the default tags
            orig_save = item.save
            def save_and_add_tags(*args, **kwargs):
                orig_save(*args, **kwargs)
                for t in self.default_tags.all():
                    item.tags.add(t)
                item.save = orig_save
            item.save = save_and_add_tags
            return item

    def refresh(self):
        """
        Update a feed instance from its source URL if there have been any
        changes to the feed's items.
        """
        feed_source = get_feed_reader(self.source_type, url=self.source_url)
        items = []

        for item_source in feed_source:
            # Get the item model corresponding to the source data
            source_id = feed_source.get_item_id(item_source)
            # TODO: Think about what to do when there are multiple content
            #       items that refer to the same source item (e.g., repeating
            #       calendar events).
            item = self.get_item(source_id=source_id)

            # If it is new or has changed, update the model with the source
            # data
            is_new = item.pk is None
            has_changed = is_new or feed_source.is_different(item, item_source)
            if has_changed:
                feed_source.update_item(item, item_source)

            items.append((item, has_changed))

        self.last_read_at = now()
        self.save()

        return items


class ContentItem (models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=160, null=True)
    tags = models.ManyToManyField('ContentTag', related_name='items')
    category = models.CharField(max_length=20)
    is_featured = models.BooleanField(default=False)
    displayed_from = models.DateTimeField()
    displayed_until = models.DateTimeField(null=True, blank=True)

    # Optional location information
    address = models.CharField(max_length=1000, default='', blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    # Information about the original source content
    feed = models.ForeignKey('Feed', related_name='items')
    source_id = models.CharField(max_length=1000)
    source_url = models.URLField()
    source_content = models.TextField()

    def __unicode__(self):
        return self.title or self.source_url

    class Meta:
        ordering = ('-displayed_from',)

    def geocode(self, commit=True):
        if not self.address:
            return

        geocoder = geocoders.GoogleV3()

        # Increase specificity of the address if it's not specific already.
        address = self.address
        if settings.GEOCODER['CITY'].lower() not in address.lower():
            address += ', ' + settings.GEOCODER['CITY']
            address += ', ' + settings.GEOCODER['STATE']

        # The geocode method may raise an exception. See
        # https://github.com/geopy/geopy/blob/master/geopy/geocoders/googlev3.py#L193
        # for possibilities.
        results = geocoder.geocode(
            address,
            bounds=settings.GEOCODER['BOUNDS'],
            region=settings.GEOCODER['REGION'],
            exactly_one=False
        )

        if (len(results) > 0):
            place, (self.lat, self.lng) = results[0]
            if commit:
                self.save()
        else:
            logger.debug('Found no locations for address %r' % (address,))


class ContentTag (models.Model):
    label = models.CharField(max_length=100, primary_key=True)

    def __unicode__(self):
        return self.label
