from django.conf.urls import patterns, include, url
from views import api_router, admin_view, refresh_feed_view

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'alexander.views.home', name='home'),
    url(r'^admin/', admin_view, name='admin'),

    url(r'^api/', include(api_router.urls)),
    url(r'^api/feeds/(?P<pk>[^/]+)/refresh/$', refresh_feed_view, name='refresh-feed'),
)
