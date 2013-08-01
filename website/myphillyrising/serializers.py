from rest_framework.serializers import ModelSerializer
from myphillyrising.models import Neighborhood, User
from utils.rest_framework_extensions import ManyToNativeMixin


class NeighborhoodSerializer(ManyToNativeMixin, ModelSerializer):
    class Meta:
        model = Neighborhood


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'last_login')
