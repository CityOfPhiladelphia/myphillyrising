from django.views.generic import TemplateView
from rest_framework import viewsets, routers
from models import Feed


class AdminView(TemplateView):
    template_name = 'alexander/index.html'


class FeedViewSet(viewsets.ModelViewSet):
    model = Feed

# Views
admin = AdminView.as_view()

# Setup the API routes
router = routers.DefaultRouter()
router.register('feeds', FeedViewSet)
