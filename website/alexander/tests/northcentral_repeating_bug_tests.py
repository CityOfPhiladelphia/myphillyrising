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
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com:0')
            num_items = events.all().count()
            assert_equals(num_items, 4)

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_recurrence_id_override_rrule_first(self, urlopen, now):
        """
        Tests that the recurrence id overrides matter
        """
        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug_rrule_first.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com:0')
            num_items = events.all().count()
            assert_equals(num_items, 4)

            earliest_event = min(events, key=lambda event: event.displayed_from)
            assert_in('All events are free!!!', earliest_event.source_content)

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_recurrence_id_override_recurrence_instance_first(self, urlopen, now):
        """
        Tests that the recurrence id overrides matter
        """
        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com:0')
            num_items = events.all().count()
            assert_equals(num_items, 4)

            earliest_event = min(events, key=lambda event: event.displayed_from)
            assert_in('All events are free!!!', earliest_event.source_content)

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_subsequen_refreshes_rrule_first(self, urlopen, now):
        """
        Tests that the subsequent refreshes go without errors.
        """
        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug_rrule_first.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()

        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug_rrule_first.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_subsequen_refreshes_recurrence_instance_first(self, urlopen, now):
        """
        Tests that the subsequent refreshes go without errors.
        """
        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()

        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_refreshes_updated_recurrence_instance(self, urlopen, now):
        """
        Tests that the an rrule in which an instance is updated still has the
        correct number of instances with the correct content.
        """
        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug_no_recurrence_id.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()

        with open(pathjoin(FIXTURE_DIR, 'northcentral_calendar_repeating_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 4, 17, 54, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='ca000c8r1o3mocc8k9pm6q9k3s@google.com:0')
            num_items = events.all().count()
            assert_equals(num_items, 4)

            earliest_event = min(events, key=lambda event: event.displayed_from)
            assert_in('All events are free!!!', earliest_event.source_content)
