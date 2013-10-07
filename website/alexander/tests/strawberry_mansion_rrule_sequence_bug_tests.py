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

        # The Strawberry Mansion calendar has an event called Mural Arts Guild
        # Shed Build at Strawberry Mansion Green Resource Center that causes
        # issues. The event is recurring, but has two sequences.
        self.feed = Feed.objects.create(
            title='Strawberry Mansion Events',
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
        with open(pathjoin(FIXTURE_DIR, 'strawberry_mansion_rrule_sequence_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='d2rtji7bt4h2mu2u4tpore5pnk@google.com:0')
            num_items = events.all().count()
            assert_equals(num_items, 4)

            events = self.feed.items.filter(source_id='d2rtji7bt4h2mu2u4tpore5pnk@google.com:1')
            num_items = events.all().count()
            assert_equals(num_items, 1)

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_subsequent_refreshes(self, urlopen, now):
        """
        Tests that the subsequent refreshes go without errors.
        """
        with open(pathjoin(FIXTURE_DIR, 'strawberry_mansion_rrule_sequence_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()

        with open(pathjoin(FIXTURE_DIR, 'strawberry_mansion_rrule_sequence_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='d2rtji7bt4h2mu2u4tpore5pnk@google.com:0')
            num_items = events.all().count()
            assert_equals(num_items, 4)

            events = self.feed.items.filter(source_id='d2rtji7bt4h2mu2u4tpore5pnk@google.com:1')
            num_items = events.all().count()
            assert_equals(num_items, 1)
