from django.forms import Form, ModelChoiceField
from myphillyrising.models import Neighborhood


class ChooseNeighborhoodForm (Form):
    neighborhood = ModelChoiceField(queryset=Neighborhood.objects.all())