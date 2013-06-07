from django.views.generic import TemplateView
from rest_framework.viewsets import ModelViewSet
from rest_framework.routers import DefaultRouter
from models import Feed


class AdminView (TemplateView):
    template_name = 'alexander/index.html'


class FeedViewSet (ModelViewSet):
    model = Feed


# Views
admin = AdminView.as_view()

# Setup the API routes
router = DefaultRouter()
router.register('feeds', FeedViewSet)
