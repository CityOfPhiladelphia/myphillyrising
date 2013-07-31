from django.views.generic import TemplateView
from myphillyrising.models import Neighborhood
from myphillyrising.serializers import NeighborhoodSerializer


class AppView (TemplateView):
    template_name = 'myphillyrising/index.html'

    def get_neighborhood_data(self):
        neighborhoods = Neighborhood.objects.all()
        serializer = NeighborhoodSerializer(neighborhoods)
        return serializer.data

    def get_context_data(self, **kwargs):
        context = super(AppView, self).get_context_data(**kwargs)
        context['neighbohood_data'] = self.get_neighborhood_data()
        return context

# Views
app_view = AppView.as_view()
