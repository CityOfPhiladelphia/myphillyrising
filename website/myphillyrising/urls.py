from django.conf.urls import patterns, include, url
import alexander.urls

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'myphillyrising.views.home', name='home'),
    # url(r'^myphillyrising/', include('myphillyrising.foo.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^djangoadmin/', include(admin.site.urls)),

    url(r'^', include(alexander.urls)),
)
