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

        # The Kensington calendar had an all-day event. These have start and
        # end times that are dates as opposed to datetimes. Date objects have
        # no timezone (tzinfo), so we have to be careful about handling both
        # cases.
        self.feed = Feed.objects.create(
            title='Kensington Events',
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

        with open(pathjoin(FIXTURE_DIR, 'kensington_entire_day_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 12, 8, 0, 0, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='rl6lktaubbp6p73urm7mjm1i1c@google.com:0')
            num_items = events.all().count()
            assert_equals(num_items, 1)

            event = events[0]
            assert_equals(json.loads(event.source_content)['DTSTART'], '2013-12-14')
            assert_equals(event.displayed_from, datetime(2013, 12, 14, tzinfo=timezone('America/New_York')))
            assert_equals(event.displayed_until, datetime(2013, 12, 15, tzinfo=timezone('America/New_York')))
