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
class TestNorthCentralCalendar(TestCase):
    def setUp(self):
        Feed.objects.all().delete()
        ContentItem.objects.all().delete()

        # The North-central calendar has an event called Women's Christian
        # Alliance that causes issues. The start date is Oct 2, today is Oct 4
        # and the number of items created doesn't match the number expected.
        self.feed = Feed.objects.create(
            title='North Central Events',
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
        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()

            events = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com')
            num_items = events.all().count()
            assert_equals(num_items, 4)

            individual_instance = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com:2013-10-09T18:00:00-04:00')
            num_items = individual_instance.all().count()
            assert_equals(num_items, 1)

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_recurrence_id(self, urlopen, now):
        """
        Tests that the refresh is successful the second time around.
        """
        now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

        # Refresh once
        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            self.feed.refresh()
            events = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com')
            individual_instance = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com:2013-10-09T18:00:00-04:00')
            first_refresh_pks = set([item.pk for item in list(events) + list(individual_instance)])

        # Reopen the file and refresh again
        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            self.feed.refresh()

            events = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com')
            num_items = events.all().count()
            assert_equals(num_items, 4)

            individual_instance = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com:2013-10-09T18:00:00-04:00')
            num_items = individual_instance.all().count()
            assert_equals(num_items, 1)

            # These should be the exact same items, not new ones.
            second_refresh_pks = set([item.pk for item in list(events) + list(individual_instance)])
            assert_equals(first_refresh_pks, second_refresh_pks)
