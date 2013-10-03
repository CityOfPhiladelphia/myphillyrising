"""
WSGI config for project project.

This module contains the WSGI application used by Django's development server
and any production WSGI deployments. It should expose a module-level variable
named ``application``. Django's ``runserver`` and ``runfcgi`` commands discover
this application via the ``WSGI_APPLICATION`` setting.

Usually you will have the standard Django WSGI application here, but it also
might make sense to replace the whole Django WSGI application with a custom one
that later delegates to the Django one. For example, you could introduce WSGI
middleware here, or combine a Django application with an application of another
framework.

"""
import os
import sys
import json

# Load DotCloud settings, if there are any to be loaded.
try:
    with open('/home/dotcloud/environment.json') as f:
        env = json.load(f)
except IOError:
    env = {}

# Make sure website is on the Python path, so that we can run the app.
CURR_DIR = os.path.dirname(__file__)
sys.path.append(os.path.join(CURR_DIR, 'website'))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myphillyrising.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Apply middleware to set the URL scheme to HTTPS if that's what we're using.
def https_middleware(application):
    def secure_application(environ, *args, **kwargs):
        environ['HTTPS'] = 'on'
        environ['wsgi.url_scheme'] = 'https'
        return application(environ, *args, **kwargs)

    if env.get('SSL_ENABLED', '').lower() == 'true':
        return secure_application
    else:
        return application

application = https_middleware(application)
