from django.conf.urls import patterns, include, url
from views import app_view, api_router, choose_neighborhood
import alexander.urls

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^', include('social_auth.urls')),
    url(r'^login/publicstuff/', include('publicstuff_tools.social_auth.urls')),
    url(r'^logout/$', 'django.contrib.auth.views.logout', name='logout', kwargs={'next_page': '/'}),
    url(r'^choose-neighborhood/$', choose_neighborhood, name='choose-neighborhood'),

    url(r'^djangoadmin/', include(admin.site.urls)),

    url(r'^', include(alexander.urls)),
    url(r'^api/', include(api_router.urls)),

    url(r'^', app_view, name='app'),
)
