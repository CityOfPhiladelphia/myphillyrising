"""
Facebook OAuth support.

This contribution adds support for Facebook OAuth service. The settings
FACEBOOK_APP_ID and FACEBOOK_API_SECRET must be defined with the values
given by Facebook application registration process.

Extended permissions are supported by defining FACEBOOK_EXTENDED_PERMISSIONS
setting, it must be a list of values to request.

By default account id and token expiration time are stored in extra_data
field, check OAuthBackend class for details on how to extend it.
"""
import cgi
import base64
import hmac
import hashlib
import time
from urllib import urlencode

from django.contrib.auth import authenticate
from django.core.urlresolvers import reverse

from social_auth.backends import SocialAuthBackend, BaseAuth
from social_auth.utils import sanitize_log_data, backend_setting, setting,\
    log, dsa_urlopen
from social_auth.exceptions import AuthException, AuthCanceled, AuthFailed,\
    AuthTokenError, AuthUnknownError


class PublicStuffBackend(SocialAuthBackend):
    """PublicStuff authentication backend"""
    name = 'publicstuff'

    # Default extra data to store
    EXTRA_DATA = [
    ]

    def get_user_id(self, details, response):
        status = response.get('status', {})

        if status.get('code') != 200:
            raise AuthException(status.get('message', 'No error provided.'))

        try:
            return response['email']
        except KeyError:
            raise AuthException(
                'No email field found. Possibilities are: %s' %
                (', '.join('"%s"' % (k,) for k in response.keys()))
            )

    def get_user_details(self, response):
        """Return user details from PublicStuff account"""
        return {'username': response.get('username', response['email']),
                'email': response['email'],
                'fullname': ' '.join([response.get('firstname') or '', response.get('lastname') or '']),
                'first_name': response.get('firstname') or '',
                'last_name': response.get('lastname') or ''}


class PublicStuffAuth (BaseAuth):
    AUTH_BACKEND = PublicStuffBackend

    def auth_url(self):
        """Must return redirect URL to auth provider"""
        
        credentials = {
            'email': self.request.POST.get('email'),
            'password': self.request.POST.get('password'),
            'callback': self.redirect
        }

        return reverse('publicstuff-auth') + '?' + urlencode(credentials)

    def auth_complete(self, *args, **kwargs):
        """Completes loging process, must return user instance"""
        response = self.request.session.get('publicstuff_auth_data')
        kwargs.update({
            'auth': self,
            'response': response,
            self.AUTH_BACKEND.name: True
        })

        return authenticate(*args, **kwargs)


# Backend definition
BACKENDS = {
    'publicstuff': PublicStuffAuth,
}
