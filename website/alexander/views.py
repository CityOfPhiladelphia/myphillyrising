from django.views.generic import TemplateView
from django.views.generic.detail import SingleObjectMixin
from rest_framework import status
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from alexander.models import Feed, ContentItem
from alexander.tasks import refresh_feed, refresh_feeds


class AdminFeedView (TemplateView):
    template_name = 'alexander/feeds.html'


class AdminItemView (TemplateView):
    template_name = 'alexander/items.html'


class FeedViewSet (ModelViewSet):
    model = Feed


class ContentItemViewSet (ModelViewSet):
    model = ContentItem

    def get_queryset(self):
        category = self.request.GET.get('category')
        if (category):
            return ContentItem.objects.filter(feed__default_category__exact=category)
        else:
            return ContentItem.objects.all()

    # TODO: Override update and/or partial_update to create related objects
    #       (namely, tags) if they do not exist.


class RefreshFeedView (SingleObjectMixin, APIView):
    model = Feed

    def put(self, request, pk):
        # We could just pass the pk straight into the refresh_feed method, but
        # we go through get_object so that HTTP 40x response situations get
        # handled.
        feed = self.get_object()
        refresh_feed.delay(feed.pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


# Views
admin_feed_view = AdminFeedView.as_view()
admin_item_view = AdminItemView.as_view()

# Setup the API routes
api_router = DefaultRouter()
api_router.register('feeds', FeedViewSet)
api_router.register('items', ContentItemViewSet)

refresh_feed_view = RefreshFeedView.as_view()
