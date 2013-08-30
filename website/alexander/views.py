from datetime import datetime
from django.core.urlresolvers import reverse_lazy
from django.views.generic import TemplateView
from django.views.generic.detail import SingleObjectMixin
from rest_framework import status
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from alexander.models import Feed, ContentItem, ContentTag
from alexander.serializers import ContentItemSerializer
from alexander.tasks import refresh_feed, refresh_feeds
from django.contrib.auth.decorators import user_passes_test
from django.utils.decorators import method_decorator


class AdminRequiredMixin(object):
    """Ensures user is authenticated as a superuser."""

    @method_decorator(user_passes_test(lambda u: u.is_superuser, reverse_lazy('admin_login')))
    def dispatch(self, *args, **kwargs):
        return super(AdminRequiredMixin, self).dispatch(*args, **kwargs)


class AdminAppMixin (object):
    def get_context_data(self, **kwargs):
        context = super(AdminAppMixin, self).get_context_data(**kwargs)
        context['tags'] = ContentTag.objects.all()
        context['NS'] = 'Alexander'
        return context


class AdminFeedView (AdminRequiredMixin, AdminAppMixin, TemplateView):
    template_name = 'alexander/feeds.html'


class AdminItemView (AdminRequiredMixin, AdminAppMixin, TemplateView):
    template_name = 'alexander/items.html'


class FeedViewSet (ModelViewSet):
    model = Feed


class ContentItemViewSet (ModelViewSet):
    model = ContentItem
    serializer_class = ContentItemSerializer
    paginate_by = 20

    def get_queryset(self):
        queryset = super(ContentItemViewSet, self).get_queryset()
        queryset = queryset.prefetch_related('tags')\
            .prefetch_related('actions')\
            .prefetch_related('actions__user')\
            .prefetch_related('actions__user__profile')

        queryset = queryset.exclude(displayed_until__lt=datetime.now())

        statuses = self.request.GET.getlist('status')
        if (statuses):
            # TODO: Make case insensitive
            queryset = queryset.filter(status__in=statuses)
        else:
            if (self.request.method == 'GET'):
                queryset = queryset.filter(status='published')

        category = self.request.GET.get('category')
        if (category):
            # TODO: Make case insensitive
            queryset = queryset.filter(category=category)

        tags = self.request.GET.getlist('tag')
        if (tags):
            # TODO: Make case insensitive
            queryset = queryset.filter(tags__in=tags)

        return queryset

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
api_router = DefaultRouter(trailing_slash=False)
api_router.register('feeds', FeedViewSet)
api_router.register('items', ContentItemViewSet)

refresh_feed_view = RefreshFeedView.as_view()
