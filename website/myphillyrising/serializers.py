from rest_framework.serializers import ModelSerializer, CharField, URLField
from myphillyrising.models import Neighborhood, User
from utils.rest_framework_extensions import ManyToNativeMixin


class NeighborhoodSerializer(ManyToNativeMixin, ModelSerializer):
    class Meta:
        model = Neighborhood


class UserSerializer(ModelSerializer):
    avatar_url = URLField(source='profile.avatar_url')
    full_name = CharField(source='profile.full_name')
    neighborhood = CharField(source='profile.neighborhood.tag_id')

    class Meta:
        model = User
        fields = ('id', 'username', 'last_login', 'avatar_url', 'full_name', 'neighborhood')