from django.conf.urls import patterns, include, url
from views import api_router, admin_feed_view, admin_item_view, refresh_feed_view

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'alexander.views.home', name='home'),
    url(r'^admin/login/$', 'django.contrib.auth.views.login', 
        name='admin_login', kwargs={'template_name': 'alexander/login.html'}),

    url(r'^admin/$', admin_item_view, name='admin_items'),
    url(r'^admin/items/', admin_item_view, name='admin_items'),
    url(r'^admin/feeds/', admin_feed_view, name='admin_feeds'),

    url(r'^api/', include(api_router.urls)),
    url(r'^api/feeds/(?P<pk>[^/]+)/refresh/$', refresh_feed_view, name='refresh-feed'),
)
