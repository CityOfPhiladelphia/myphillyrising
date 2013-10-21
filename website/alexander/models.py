from django.conf import settings
from django.db import models
from django.db.models import query
from django.utils.translation import ugettext as _
from django.utils.timezone import now, timedelta
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
    is_trusted = models.BooleanField(default=False)

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

    def get_items(self, **kwargs):
        return self.items.filter(**kwargs)

    def make_new_items(self, count, **kwargs):
        items = []
        for index in xrange(count):
            item = ContentItem(feed=self, category=self.default_category, **kwargs)
            items.append(item)
        return items

    def refresh(self):
        """
        Update a feed instance from its source URL if there have been any
        changes to the feed's items.
        """
        feed_source = get_feed_reader(self.source_type, url=self.source_url)
        changed_items = []
        new_items = []
        all_items = []
        is_new = lambda item: item.pk is None
        seen_source_ids = set()

        self.errors = []

        # Loop through each item from the source
        for item_source in feed_source:
            # Get the source id and the expected number of corresponding items
            source_id = feed_source.get_item_id(item_source)
            occurrence_count, from_dt, until_dt = feed_source.get_occurrence_count(item_source)

            # If date filters were returned, add them as filter parameters
            extra_params = {}
            if from_dt:
                extra_params['displayed_from__gte'] = from_dt
            if until_dt:
                extra_params['displayed_until__lte'] = until_dt

            # Get the item model(s) corresponding to the source data
            items = list(self.get_items(source_id=source_id, **extra_params))
            existing_count = len(items)
            if existing_count < occurrence_count:
                items.extend(self.make_new_items(occurrence_count - existing_count))

            # If it is new or has changed, update the model with the source
            # data
            new_flags = [is_new(item) for item in items]
            changed_flags = [feed_source.is_different(item, item_source) for item in items]

            has_new = any(new_flags)
            has_changed = any(changed_flags)

            if has_new or has_changed:
                try:
                    feed_source.update_items(items, item_source)
                except ValueError as exc:
                    error_str = ('Failed to update the feed %s items %s from '
                                 'the source item with id %s: %s' %
                                 (self, items, source_id, exc))
                    logger.error(error_str)
                    self.errors.append(error_str)
                    continue

                # Save all the changed items
                for item in items:
                    item.save()
                changed_items.extend(items)

            # Apply tags to everything that's new
            for item, item_is_new in zip(items, new_flags):
                if not item_is_new:
                    continue

                tags = tuple(item.feed.default_tags.all())
                item.tags.add(*tags)

                # Auto publish if this is a trusted feed
                if self.is_trusted:
                    item.status = 'published'
                    item.save()

            # No matter what, note that we've seen the item
            seen_source_ids.add(source_id)
            all_items.extend((item, has_new or has_changed) for item in items)

        self.last_read_at = now()
        self.save()

        # ICS feeds return a complete set of events each time, so we might as
        # well clean out events that no longer exist.
        if self.source_type.lower() in ('ical', 'ics'):
            all_source_ids = set(
                item.source_id 
                for item in self.items.all()
            )
            unseen_source_ids = all_source_ids - seen_source_ids
            self.items.filter(source_id__in=unseen_source_ids).delete()

        return all_items


class ContentItem (models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=160, null=True, blank=True)
    tags = models.ManyToManyField('ContentTag', related_name='items')
    category = models.CharField(max_length=20)
    is_featured = models.BooleanField(default=False)
    displayed_from = models.DateTimeField()
    displayed_until = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')

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
