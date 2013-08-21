from django.test import TestCase
from django.test.utils import override_settings
from nose.tools import assert_equals
from mock import patch


@override_settings(CELERY_ALWAYS_EAGER=True)
class TestGeocoding(TestCase):
    def test_rate_limited_geocodes_get_retried(self):
        """
        Tests that the geocode_contentitem task will retry as long as the
        geocoder raises a rate limiting error.
        """
        from alexander.tasks import geocode_contentitem
        from geopy.geocoders.googlev3 import GTooManyQueriesError

        def stub_geocode(*args, **kwargs):
            # Raise a rate-limit error twice
            try:
                if stub_geocode.tries < 2:
                    raise GTooManyQueriesError()
            finally:
                stub_geocode.tries += 1
            # Succeed the third time
            return []
        stub_geocode.tries = 0

        with patch('geopy.geocoders.GoogleV3.geocode', stub_geocode):
            item_id = 0; address = ''
            geocode_contentitem.delay(item_id, address, retry_delay=0)

        assert_equals(stub_geocode.tries, 3)
