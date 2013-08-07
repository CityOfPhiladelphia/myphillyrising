import json
from django.db.models import Sum
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from myphillyrising.models import Neighborhood, User, UserProfile, UserAction
from myphillyrising.serializers import NeighborhoodSerializer, UserSerializer, LoggedInUserSerializer, ActionSerializer
from myphillyrising.services import default_twitter_service


class MyPhillyRisingViewMixin (object):
    def get_user_queryset(self):
        return User.objects.all()\
            .select_related('profile')\
            .exclude(profile=None)\
            .select_related('profile__neighborhood')\
            .annotate(points=Sum('profile__actions__points'))

    def get_neighborhood_queryset(self):
        return Neighborhood.objects.all()\
            .annotate(user_points=Sum('profiles__actions__points'))\
            .annotate(item_points=Sum('tag__items__actions__points'))


class AppView (MyPhillyRisingViewMixin, TemplateView):
    template_name = 'myphillyrising/index.html'

    def get_neighborhood_data(self):
        neighborhoods = self.get_neighborhood_queryset()
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
                queryset = self.get_user_queryset()
                serializer = LoggedInUserSerializer(queryset.get(pk=current_user.pk))
                return serializer.data
        else:
            return {}

    def get_context_data(self, **kwargs):
        context = super(AppView, self).get_context_data(**kwargs)
        context['neighborhood_data'] = self.get_neighborhood_data()
        context['current_user_data'] = self.get_current_user_data()
        context['twitter_config'] = json.dumps(default_twitter_service.get_config())
        context['NS'] = 'MyPhillyRising'
        return context


class UserViewSet (MyPhillyRisingViewMixin, ModelViewSet):
    model = User
    serializer_class = UserSerializer
    paginate_by = 20

    def get_queryset(self):
        queryset = self.get_user_queryset()
        neighborhoods = self.request.GET.getlist('neighborhood')
        if (neighborhoods):
            queryset = queryset.filter(profile__neighborhood__tag_id__in=neighborhoods)

        return queryset

    def get_serializer_class(self, *args, **kwargs):
        if hasattr(self, 'object') and self.object is not None:
            if self.object.pk == self.request.user.pk:
                return LoggedInUserSerializer
        return super(UserViewSet, self).get_serializer_class(*args, **kwargs)


class ActionViewSet (MyPhillyRisingViewMixin, ModelViewSet):
    model = UserAction
    serializer_class = ActionSerializer
    paginate_by = 20


# Views
app_view = AppView.as_view()

# Setup the API routes
api_router = DefaultRouter(trailing_slash=False)
api_router.register('users', UserViewSet)
api_router.register('actions', ActionViewSet)
