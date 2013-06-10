from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.core.exceptions import ImproperlyConfigured
from django.utils.importlib import import_module
import django
import logging
import sys

from ...models import Feed

class Command(BaseCommand):
    help = "Load new items from content feed sources"

    def handle(self, *args, **options):
        feeds = Feed.objects.all()
        if args:
            feeds = feeds.filter(pk__in=args)
        feeds.refresh()