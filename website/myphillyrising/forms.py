from django.forms import Form, ModelChoiceField, CharField
from myphillyrising.models import Neighborhood


class ChooseNeighborhoodForm (Form):
    neighborhood = ModelChoiceField(queryset=Neighborhood.objects.all())
    auth_provider = CharField()