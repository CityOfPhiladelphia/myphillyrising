from django.conf.urls import url, patterns

urlpatterns = patterns(
    '',
    url(r'^login/publicstuff/proxy$',
        'publicstuff_tools.social_auth.views.publicstuff_auth_view',
        name='publicstuff-auth'),
)