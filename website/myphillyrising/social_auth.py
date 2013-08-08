from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from models import UserProfile
from services import CacheService


def get_user_profile(*auth_args, **auth_kwargs):
    user = auth_kwargs['social_user'].user

    if auth_kwargs.get('is_new'):
        profile = UserProfile(user=user)
    else:
        profile, created = UserProfile.objects.get_or_create(user=user)
    return {'profile': profile}


def get_neighborhood_preference(*auth_args, **auth_kwargs):
    # Depends on get_user_profile

    request = auth_kwargs['request']
    profile = auth_kwargs['profile']

    # Get the neighborhood from the user or the session
    neighborhood = profile.neighborhood or request.session.get('neighborhood', None)

    # Redirect to the neighborhood choice form if no neighborhood hs been set
    if neighborhood is None:
        url = reverse('choose-neighborhood', args=(auth_kwargs['backend'].name,))
        return HttpResponseRedirect(url)

    if 'neighborhood' in request.session:
        del request.session['neighborhood']
    
    return {'neighborhood': neighborhood}


def update_user_profile(*auth_args, **auth_kwargs):
    # Depends on get_user_profile and get_neighborhood_preference

    user_info = auth_kwargs['response']
    profile = auth_kwargs['profile']
    new_neighborhood = auth_kwargs.get('neighborhood')

    service = CacheService.get_social_media_service(auth_kwargs['backend'].name)

    profile.avatar_url = service.extract_avatar_url(user_info)
    profile.full_name = service.extract_full_name(user_info)
    profile.neighborhood = new_neighborhood or profile.neighborhood
    profile.save()



# import json
# from social_auth.backends import SocialAuthBackend
# from social_auth.exceptions import AuthCanceled


# class DummySocialBackend(SocialAuthBackend):
#     """Twitter OAuth authentication backend"""
#     name = 'dummy'
#     EXTRA_DATA = [('id', 'id')]

#     def get_user_details(self, response):
#         """Return user details from Twitter account"""
#         try:
#             first_name, last_name = response['name'].split(' ', 1)
#         except:
#             first_name = response['name']
#             last_name = ''
#         return {'username': response['screen_name'],
#                 'email': '',  # not supplied
#                 'fullname': response['name'],
#                 'first_name': first_name,
#                 'last_name': last_name}

#     @classmethod
#     def tokens(cls, instance):
#         """Return the tokens needed to authenticate the access to any API the
#         service might provide. Twitter uses a pair of OAuthToken consisting of
#         an oauth_token and oauth_token_secret.

#         instance must be a UserSocialAuth instance.
#         """
#         token = super(TwitterBackend, cls).tokens(instance)
#         if token and 'access_token' in token:
#             token = dict(tok.split('=')
#                             for tok in token['access_token'].split('&'))
#         return token


# # Backend definition
# BACKENDS = {
#     'dummy': DummyAuth,
# }
