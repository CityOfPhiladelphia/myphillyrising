from django.conf.urls import patterns, include, url
from views import router, admin

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'alexander.views.home', name='home'),
    url(r'^admin/', admin, name='admin'),
    url(r'^api/', include(router.urls))
)
