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
class TestMarketEastCalendar(TestCase):
    def setUp(self):
        Feed.objects.all().delete()
        ContentItem.objects.all().delete()

        # The Market East calendar has an event called Market East Live!
        # that causes issues. The event is recurring, but has two exception
        # dates.
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
        with open(pathjoin(FIXTURE_DIR, 'market_east_exdate_bug.ics')) as icalfile:
            urlopen.return_value = icalfile
            now.return_value = datetime(2013, 10, 3, 17, 54, tzinfo=utc)

            self.feed.refresh()
            assert_equals(self.feed.errors, [])

            events = self.feed.items.filter(source_id='ak30b02u7858q1oo6ji9dm4mgg@google.com:0')
            num_items = events.all().count()
            assert_equals(num_items, 4)
            assert_equals(
                set([e.displayed_from for e in events]),
                set([
                    datetime(2013, 10, 4, 16, 0, tzinfo=utc),
                    datetime(2013, 10, 5, 16, 0, tzinfo=utc),
                    # Exclude the 12th and 13th...
                    datetime(2013, 10, 18, 16, 0, tzinfo=utc),
                    datetime(2013, 10, 19, 16, 0, tzinfo=utc),
                ])
            )
