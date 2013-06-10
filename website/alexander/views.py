from django.views.generic import TemplateView
from django.views.generic.detail import SingleObjectMixin
from rest_framework import status
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from alexander.models import Feed
from alexander.tasks import refresh_feed, refresh_feeds


class AdminView (TemplateView):
    template_name = 'alexander/index.html'


class FeedViewSet (ModelViewSet):
    model = Feed


class RefreshFeedView (SingleObjectMixin, APIView):
    model = Feed

    def put(self, request, pk):
        feed = self.get_object()
        refresh_feed.delay(feed.pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


# Views
admin_view = AdminView.as_view()

# Setup the API routes
api_router = DefaultRouter()
api_router.register('feeds', FeedViewSet)

refresh_feed_view = RefreshFeedView.as_view()
