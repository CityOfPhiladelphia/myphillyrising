# -*- coding: utf-8 -*-

from django.test import TestCase
from django.test.utils import override_settings
from django.utils.timezone import datetime
from nose.tools import assert_equals, assert_false
from mock import patch
from os.path import dirname, join as pathjoin

FIXTURE_DIR = pathjoin(dirname(__file__), 'fixtures')

@override_settings(CELERY_ALWAYS_EAGER=True)
class TestFeedRefreshing(TestCase):
    def setUp(self):
        from alexander.models import ContentItem, Feed

        Feed.objects.all().delete()
        ContentItem.objects.all().delete()

        Feed.objects.create(id=0, title='Test Feed', source_url='http://example.com/ics', source_type='ical', default_category='events')

        self.item_123_id = 1
        self.item_124_id = 2
        ContentItem.objects.create(id=self.item_123_id, category='events', displayed_from=datetime(1970, 1, 1), feed_id=0, source_id='123@example.com', source_url='http://example.com/ics', source_content='{}')
        ContentItem.objects.create(id=self.item_124_id, category='events', displayed_from=datetime(1970, 1, 1), feed_id=0, source_id='124@example.com', source_url='http://example.com/ics', source_content=open(pathjoin(FIXTURE_DIR, 'testevent124.json')).read(), title='modified title')

    @patch('alexander.feed_readers.urlopen')
    def test_refresh_creates_new_content(self, urlopen):
        """
        Tests that content items that do not exist yet are created.
        """
        from alexander.models import Feed, ContentItem

        feed = Feed.objects.get(pk=0)

        with open(pathjoin(FIXTURE_DIR, 'testcal123.ics')) as icalfile:
            urlopen.return_value = icalfile

            item = ContentItem.objects.get(pk=self.item_123_id)
            item.delete()
            num_items = ContentItem.objects.all().count()

            feed.refresh()

            assert_equals(num_items + 1, ContentItem.objects.all().count())

    @patch('alexander.feed_readers.urlopen')
    def test_refresh_updates_stale_content(self, urlopen):
        """
        Tests that stale content items whose content has become out of sync
        with the source feed are updated.
        """
        from alexander.models import Feed, ContentItem

        feed = Feed.objects.get(pk=0)

        with open(pathjoin(FIXTURE_DIR, 'testcal123.ics')) as icalfile:
            urlopen.return_value = icalfile

            feed.refresh()
            item = ContentItem.objects.get(pk=self.item_123_id)

            assert_equals(item.address, u'Drexel’s ExCITe Center, 34th and Market St')
            assert_equals(item.title, u'This test event’s summary')

    @patch('alexander.feed_readers.urlopen')
    def test_refresh_does_not_update_fresh_content(self, urlopen):
        """
        Tests that fresh content items are not modified.
        """
        from alexander.models import Feed, ContentItem

        feed = Feed.objects.get(pk=0)

        with patch.object(ContentItem, 'save') as item_save:
            with open(pathjoin(FIXTURE_DIR, 'testcal124.ics')) as icalfile:
                urlopen.return_value = icalfile

                item = ContentItem.objects.get(pk=self.item_124_id)
                content = item.source_content

                feed.refresh()
                item = ContentItem.objects.get(pk=self.item_124_id)

                assert_equals(content, item.source_content)
                assert_false(item_save.called)
                assert_equals(item.title, 'modified title')
