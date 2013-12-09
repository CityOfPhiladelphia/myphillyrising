# -*- coding: utf-8 -*-

from django.test import TestCase
from django.test.utils import override_settings
from django.utils.timezone import datetime, utc
from nose.tools import assert_equals, assert_false, assert_in, assert_not_in, assert_true
from mock import patch
from os.path import dirname, join as pathjoin
from pytz import timezone
from alexander.models import ContentItem, Feed

FIXTURE_DIR = pathjoin(dirname(__file__), 'fixtures')

@override_settings(CELERY_ALWAYS_EAGER=True)
class TestStrawberryMansionCalendar(TestCase):
    def setUp(self):
        Feed.objects.all().delete()
        ContentItem.objects.all().delete()

        # The Market East calendar has a recurring event that is 
        self.feed = Feed.objects.create(
            title='Market East Events',
            source_url='http://example.com/ics',
            source_type='ics',
            default_category='events'
        )

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_rrule(self, urlopen, now):
        """
        Tests that the right number of events are created from the rrule.
        """
        import json

        with open(pathjoin(FIXTURE_DIR, 'market_east_date_not_found_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 20, 0, 0, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='077bvv1i0dlfutnpboet6ls23k@google.com:1')
            num_items = events.all().count()
            assert_equals(num_items, 8)
