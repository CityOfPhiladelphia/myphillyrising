from django.conf.urls import patterns, include, url
from views import app_view, api_router, choose_neighborhood, robots_view, sitemap_view, phila_gis_proxy_view
import alexander.urls

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^', include('social_auth.urls')),
    url(r'^login/publicstuff/', include('publicstuff_tools.social_auth.urls')),
    url(r'^logout/$', 'django.contrib.auth.views.logout', name='logout', kwargs={'next_page': '/'}),
    url(r'^choose-neighborhood/$', choose_neighborhood, name='choose-neighborhood'),
    url(r'^robots.txt$', robots_view, name='robots'),
    url(r'^sitemap.xml$', sitemap_view, name='sitemap'),

    url(r'^djangoadmin/', include(admin.site.urls)),

    url(r'^', include(alexander.urls)),
    url(r'^api/', include(api_router.urls)),
    url(r'^phila_gis/(.*)$', phila_gis_proxy_view, name='phila-gis-proxy'),

    url(r'^', app_view, name='app'),
)
