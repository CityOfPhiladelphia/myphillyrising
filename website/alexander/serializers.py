from rest_framework import serializers
from . import models


class FeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Feed


class ContentItemSerializer(serializers.ModelSerializer):
    source_type = serializers.CharField(source='feed.source_type', read_only=True)

    class Meta:
        model = models.ContentItem
