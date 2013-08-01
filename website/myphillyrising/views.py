from django.views.generic import TemplateView
from myphillyrising.models import Neighborhood
from myphillyrising.serializers import NeighborhoodSerializer, UserSerializer


class AppView (TemplateView):
    template_name = 'myphillyrising/index.html'

    def get_neighborhood_data(self):
        neighborhoods = Neighborhood.objects.all()
        serializer = NeighborhoodSerializer(neighborhoods)
        return serializer.data

    def get_current_user_data(self):
        current_user = self.request.user
        if current_user.is_authenticated():
            serializer = UserSerializer(current_user)
            return serializer.data
        else:
            return {}

    def get_context_data(self, **kwargs):
        context = super(AppView, self).get_context_data(**kwargs)
        context['neighborhood_data'] = self.get_neighborhood_data()
        context['current_user_data'] = self.get_current_user_data()
        context['NS'] = 'MyPhillyRising'
        return context

# Views
app_view = AppView.as_view()
