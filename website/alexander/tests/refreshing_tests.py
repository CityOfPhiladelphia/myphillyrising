# -*- coding: utf-8 -*-

from django.test import TestCase
from django.test.utils import override_settings
from django.utils.timezone import datetime
from nose.tools import assert_equals, assert_false, assert_in, assert_not_in
from mock import patch
from os.path import dirname, join as pathjoin
from pytz import timezone

FIXTURE_DIR = pathjoin(dirname(__file__), 'fixtures')

@override_settings(CELERY_ALWAYS_EAGER=True)
class TestFeedRefreshing(TestCase):
    def setUp(self):
        from alexander.models import ContentItem, Feed

        Feed.objects.all().delete()
        ContentItem.objects.all().delete()

        # Simple iCal feed
        feed = Feed.objects.create(title='Test Feed', source_url='http://example.com/ics', source_type='ical', default_category='events')
        self.feed_simple_cal_id = feed.id
        i1 = ContentItem.objects.create(category='events', displayed_from=datetime(1970, 1, 1), feed_id=self.feed_simple_cal_id, source_id='123@example.com', source_url='http://example.com/ics', source_content='{}')
        i2 = ContentItem.objects.create(category='events', displayed_from=datetime(1970, 1, 1), feed_id=self.feed_simple_cal_id, source_id='124@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent124.json')).read(), title='modified title')
        self.item_123_id = i1.id
        self.item_124_id = i2.id

        # Recurrence rule testing data
        feed = Feed.objects.create(title='Test Recurrence Feed', source_url='http://example.com/ics', source_type='ical', default_category='events')
        self.feed_rrules_id = feed.id

        i1 = ContentItem.objects.create(category='events', displayed_from=datetime(2013, 5, 31, 16, 0, tzinfo=timezone('UTC')), displayed_until=datetime(2013, 5, 31, 22, 0, tzinfo=timezone('UTC')), feed_id=self.feed_rrules_id, source_id='finite@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent_finite.json')).read())
        i2 = ContentItem.objects.create(category='events', displayed_from=datetime(2013, 6, 1, 16, 0, tzinfo=timezone('UTC')), displayed_until=datetime(2013, 6, 1,22, 0, tzinfo=timezone('UTC')), feed_id=self.feed_rrules_id, source_id='finite@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent_finite.json')).read())
        self.item_finite_ev_1 = i1.id
        self.item_finite_ev_2 = i2.id

        i1 = ContentItem.objects.create(category='events', displayed_from=datetime(2013, 5, 31, 16, 0, tzinfo=timezone('UTC')), displayed_until=datetime(2013, 5, 31, 22, 0, tzinfo=timezone('UTC')), feed_id=self.feed_rrules_id, source_id='infinite@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent_infinite.json')).read())
        i2 = ContentItem.objects.create(category='events', displayed_from=datetime(2013, 6, 1, 16, 0, tzinfo=timezone('UTC')), displayed_until=datetime(2013, 6, 1, 22, 0, tzinfo=timezone('UTC')), feed_id=self.feed_rrules_id, source_id='infinite@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent_infinite.json')).read())
        self.item_infinite_ev_1 = i1.id
        self.item_infinite_ev_2 = i2.id

        # Recurrence rule testing data where the dates don't match the source data
        feed = Feed.objects.create(title='Test Recurrence Feed', source_url='http://example.com/ics', source_type='ical', default_category='events')
        self.feed_rrules_outdated_id = feed.id

        i1 = ContentItem.objects.create(category='events', displayed_from=datetime(2013, 5, 31, 15, 0, tzinfo=timezone('UTC')), displayed_until=datetime(2013, 5, 31, 21, 0, tzinfo=timezone('UTC')), feed_id=self.feed_rrules_outdated_id, source_id='finite@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent_finite_outdated.json')).read())
        i2 = ContentItem.objects.create(category='events', displayed_from=datetime(2013, 6, 1, 15, 0, tzinfo=timezone('UTC')), displayed_until=datetime(2013, 6, 1,21, 0, tzinfo=timezone('UTC')), feed_id=self.feed_rrules_outdated_id, source_id='finite@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent_finite_outdated.json')).read())
        self.item_finite_outdated_ev_1 = i1.id
        self.item_finite_outdated_ev_2 = i2.id

        i1 = ContentItem.objects.create(category='events', displayed_from=datetime(2013, 5, 31, 15, 0, tzinfo=timezone('UTC')), displayed_until=datetime(2013, 5, 31, 21, 0, tzinfo=timezone('UTC')), feed_id=self.feed_rrules_outdated_id, source_id='infinite@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent_infinite_outdated.json')).read())
        i2 = ContentItem.objects.create(category='events', displayed_from=datetime(2013, 6, 1, 15, 0, tzinfo=timezone('UTC')), displayed_until=datetime(2013, 6, 1, 21, 0, tzinfo=timezone('UTC')), feed_id=self.feed_rrules_outdated_id, source_id='infinite@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent_infinite_outdated.json')).read())
        self.item_infinite_outdated_ev_1 = i1.id
        self.item_infinite_outdated_ev_2 = i2.id

        # Simple RSS feed
        feed = Feed.objects.create(title='Test Feed', source_url='http://example.com/rss', source_type='rss', default_category='stories')
        self.feed_simple_rss_id = feed.id
        i1 = ContentItem.objects.create(category='stories', displayed_from=datetime(1970, 1, 1), feed_id=self.feed_simple_rss_id, source_id='www.facebook.com/notification/1', source_url='http://example.com/rss', source_content=open(pathjoin(FIXTURE_DIR, 'teststory1.json')).read(), title='modified title')
        i2 = ContentItem.objects.create(category='stories', displayed_from=datetime(1970, 1, 1), feed_id=self.feed_simple_rss_id, source_id='www.facebook.com/notification/2', source_url='http://example.com/rss', source_content='{}')
        self.item_fb1_id = i1.id
        self.item_fb2_id = i2.id

    @patch('alexander.feed_readers.urlopen')
    def test_refresh_creates_new_content(self, urlopen):
        """
        Tests that content items that do not exist yet are created.
        """
        from alexander.models import Feed, ContentItem

        feed = Feed.objects.get(pk=self.feed_simple_cal_id)

        with open(pathjoin(FIXTURE_DIR, 'testcal123.ics')) as icalfile:
            urlopen.return_value = icalfile

            item = ContentItem.objects.get(pk=self.item_123_id)
            item.delete()
            num_items = ContentItem.objects.all().count()

            feed.refresh()

            assert_equals(num_items + 1, ContentItem.objects.all().count())

    @patch('alexander.feed_readers.urlopen')
    def test_refresh_updates_stale_events(self, urlopen):
        """
        Tests that stale content items whose content has become out of sync
        with the source feed are updated.
        """
        from alexander.models import Feed, ContentItem

        feed = Feed.objects.get(pk=self.feed_simple_cal_id)

        with open(pathjoin(FIXTURE_DIR, 'testcal123.ics')) as icalfile:
            urlopen.return_value = icalfile

            feed.refresh()
            item = ContentItem.objects.get(pk=self.item_123_id)

            assert_equals(item.address, u'Drexel’s ExCITe Center, 34th and Market St')
            assert_equals(item.title, u'This test event’s summary')

    @patch('alexander.feed_readers.urlopen')
    def test_refresh_does_not_update_fresh_events(self, urlopen):
        """
        Tests that fresh ical content items are not modified.
        """
        from alexander.models import Feed, ContentItem

        feed = Feed.objects.get(pk=self.feed_simple_cal_id)

        with patch.object(ContentItem, 'save') as item_save:
            with open(pathjoin(FIXTURE_DIR, 'testcal124.ics')) as icalfile:
                urlopen.return_value = icalfile

                item = ContentItem.objects.get(pk=self.item_124_id)
                content = item.source_content

                feed.refresh()
                item = ContentItem.objects.get(pk=self.item_124_id)

                # The serialized content in the item should be the same as 
                # what was loaded in initially from the test fixture.
                assert_equals(content, item.source_content)
                # Since the content was the same, the item should not have
                # had to be saved (i.e., by update_item)
                assert_false(item_save.called)
                # Since the item was not saved with the imported information,
                # the title should still be modified from what's in the feed.
                assert_equals(item.title, 'modified title')

    @patch('alexander.feed_readers.parserss')
    def test_refresh_updates_stale_stories(self, parserss):
        """
        Tests that stale story items whose content has become out of sync
        with the source feed are updated.
        """
        from alexander.models import Feed, ContentItem
        import feedparser
        parserss.return_value = feedparser.parse(pathjoin(FIXTURE_DIR, 'testfbfeed2.rss'))

        feed = Feed.objects.get(pk=self.feed_simple_rss_id)

        original_count = ContentItem.objects.all().count()

        # import pdb; pdb.set_trace()
        feed.refresh()
        item = ContentItem.objects.get(pk=self.item_fb2_id)
        updated_count = ContentItem.objects.all().count()

        assert_equals(original_count, updated_count)
        assert_equals(item.title, u'Vote 4 @PhillyMDO! RT @StateTech: @PhillyMDO Your blog has been nominated as a m...')

    @patch('alexander.feed_readers.parserss')
    def test_refresh_does_not_update_fresh_stories(self, parserss):
        """
        Tests that fresh rss content items are not modified.
        """
        from alexander.models import Feed, ContentItem
        import feedparser
        parserss.return_value = feedparser.parse(pathjoin(FIXTURE_DIR, 'testfbfeed1.rss'))

        feed = Feed.objects.get(pk=self.feed_simple_rss_id)

        with patch.object(ContentItem, 'save') as item_save:
            item = ContentItem.objects.get(pk=self.item_fb1_id)
            original_count = ContentItem.objects.all().count()
            content = item.source_content

            # import pdb; pdb.set_trace()
            feed.refresh()
            item = ContentItem.objects.get(pk=self.item_fb1_id)
            updated_count = ContentItem.objects.all().count()

            # No new content items should have been created.
            assert_equals(original_count, updated_count)
            # The serialized content in the item should be the same as 
            # what was loaded in initially from the test fixture.
            assert_equals(content, item.source_content)
            # Since the content was the same, the item should not have
            # had to be saved (i.e., by update_item)
            assert_false(item_save.called)
            # Since the item was not saved with the imported information,
            # the title should still be modified from what's in the feed.
            assert_equals(item.title, 'modified title')

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_items_created_for_next_month_of_recurring_events(self, urlopen, now):
        from alexander.models import Feed, ContentItem

        feed = Feed.objects.get(pk=self.feed_rrules_id)

        with open(pathjoin(FIXTURE_DIR, 'testcal_rrules.ics')) as icalfile:
            now.return_value = datetime(2013, 5, 31, 20, 0, tzinfo=timezone('UTC'))
            urlopen.return_value = icalfile

            feed.refresh()
            items = ContentItem.objects.filter(source_id='infinite@example.com', feed_id=self.feed_rrules_id)

            assert_equals(len(items), 10)
            assert_equals([i.id for i in items][-2:], [self.item_infinite_ev_2, self.item_infinite_ev_1])

    @patch('alexander.feed_readers.now')
    @patch('alexander.feed_readers.urlopen')
    def test_existing_events_wiped_out_when_recurring_date_changes(self, urlopen, now):
        from alexander.models import Feed, ContentItem

        feed = Feed.objects.get(pk=self.feed_rrules_outdated_id)

        with open(pathjoin(FIXTURE_DIR, 'testcal_rrules.ics')) as icalfile:
            now.return_value = datetime(2013, 5, 31, 20, 0, tzinfo=timezone('UTC'))
            urlopen.return_value = icalfile

            feed.refresh()
            items = ContentItem.objects.filter(source_id='infinite@example.com', feed_id=self.feed_rrules_outdated_id)

            assert_equals(len(items), 10)
            assert_in(self.item_infinite_outdated_ev_1, [i.id for i in items])
            assert_not_in(self.item_infinite_outdated_ev_2, [i.id for i in items])
