from django.test import TestCase
from django.test.utils import override_settings
from django.utils.timezone import datetime
from nose.tools import assert_equals, assert_false, assert_true
from mock import patch
from os.path import dirname, join as pathjoin

FIXTURE_DIR = pathjoin(dirname(__file__), 'fixtures')

@override_settings(CELERY_ALWAYS_EAGER=True)
class TestGeocoding(TestCase):
    def setUp(self):
        from alexander.models import ContentItem, Feed

        Feed.objects.all().delete()
        ContentItem.objects.all().delete()

        Feed.objects.create(id=0, title='Test Feed', source_url='http://example.com/ics', source_type='ical', default_category='events')
        ContentItem.objects.create(id=0, category='events', displayed_from=datetime(1970, 1, 1), address='123 Sesame St.', feed_id=0, source_id='123', source_url='http://example.com/ics')
        ContentItem.objects.create(id=1, category='events', displayed_from=datetime(1970, 1, 1), feed_id=0, source_id='124', source_url='http://example.com/ics')

    def test_rate_limited_geocodes_get_retried(self):
        """
        Tests that the geocode_contentitem task will retry as long as the
        geocoder raises a rate limiting error.
        """
        from alexander.models import ContentItem
        from alexander.tasks import geocode_contentitem
        from geopy.geocoders.googlev3 import GTooManyQueriesError as LimitExc

        with patch.object(ContentItem, 'geocode') as item_geocode:
            item_geocode.side_effect = [LimitExc(), LimitExc(), None]

            result = geocode_contentitem.delay(0, retry_delay=0)
            result.get()

            assert_equals(ContentItem.geocode.call_count, 3)

    def test_geocode_item_with_no_address(self):
        """
        Tests that the geocode is not called if the item has no address.
        """
        from alexander.models import ContentItem, geocoders

        with patch.object(geocoders.GoogleV3, 'geocode') as geocode:
            item = ContentItem.objects.get(pk=1)
            item.geocode()
            
            assert_false(geocode.called)

    def test_geocode_item_with_address(self):
        """
        Tests that the geocoder is called if the item has an address.
        """
        from alexander.models import ContentItem, geocoders

        with patch.object(geocoders.GoogleV3, 'geocode') as geocode:
            geocode.return_value = [(None, (-75, 40))]

            item = ContentItem.objects.get(pk=0)
            item.geocode()

            assert_true(geocoders.GoogleV3.geocode.called)
            assert_equals((item.lat, item.lng), (-75, 40))
