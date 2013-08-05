from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from myphillyrising.models import Neighborhood, User, UserProfile
from myphillyrising.serializers import NeighborhoodSerializer, UserSerializer


class MyPhillyRisingViewMixin (object):
    def get_user_queryset(self):
        return User.objects.all()\
            .select_related('profile')\
            .exclude(profile=None)\
            .select_related('profile__neighborhood')


class AppView (MyPhillyRisingViewMixin, TemplateView):
    template_name = 'myphillyrising/index.html'

    def get_neighborhood_data(self):
        neighborhoods = Neighborhood.objects.all()
        serializer = NeighborhoodSerializer(neighborhoods)
        return serializer.data

    def get_current_user_data(self):
        current_user = self.request.user
        if current_user.is_authenticated():
            try:
                current_user.profile
            except UserProfile.DoesNotExist:
                return {}
            else:
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


class UserViewSet (MyPhillyRisingViewMixin, ModelViewSet):
    model = User
    serializer_class = UserSerializer
    paginate_by = 20

    def get_queryset(self):
        queryset = User.objects.all()\
            .select_related('profile')\
            .exclude(profile=None)\
            .select_related('profile__neighborhood')

        neighborhoods = self.request.GET.getlist('neighborhood')
        if (neighborhoods):
            queryset = queryset.filter(profile__neighborhood__tag_id__in=neighborhoods)

        return queryset


# Views
app_view = AppView.as_view()

# Setup the API routes
api_router = DefaultRouter(trailing_slash=False)
api_router.register('users', UserViewSet)
