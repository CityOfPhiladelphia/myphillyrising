from rest_framework.serializers import ModelSerializer
from myphillyrising.models import Neighborhood
from utils.rest_framework_extensions import ManyToNativeMixin


class NeighborhoodSerializer(ManyToNativeMixin, ModelSerializer):
    class Meta:
        model = Neighborhood
