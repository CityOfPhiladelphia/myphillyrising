from rest_framework.serializers import ModelSerializer, CharField, URLField
from myphillyrising.models import User, UserAction
from .models import Feed, ContentItem


class FeedSerializer(ModelSerializer):
    class Meta:
        model = Feed


class MinimalFeedSerializer(ModelSerializer):
    class Meta:
        model = Feed
        fields = ('id', 'title')


class MinimalUserSerializer(ModelSerializer):
    full_name = CharField(source='profile.full_name')
    avatar_url = URLField(source='profile.avatar_url')

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'avatar_url')


class ContentItemActionSerializer(ModelSerializer):
    user = MinimalUserSerializer()

    class Meta:
        model = UserAction
        fields = ('user', 'type')


class ContentItemSerializer(ModelSerializer):
    source_type = CharField(source='feed.source_type', read_only=True)
    actions = ContentItemActionSerializer(many=True)
    feed = MinimalFeedSerializer()

    class Meta:
        model = ContentItem
