import json
from urllib import urlencode
from urllib2 import urlopen
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.views.generic import TemplateView


def publicstuff_auth_view(request):
    credentials = {
        'email': request.REQUEST.get('email'),
        'password': request.REQUEST.get('password')
    }
    publicstuff_url = ('https://www.publicstuff.com/api/2.0/user_login/?' +
                       urlencode(credentials))
    callback_url = request.REQUEST.get('callback')
    invalid_url = reverse('publicstuff-invalid-login')

    publicstuff = urlopen(publicstuff_url)
    data = json.load(publicstuff)

    if isinstance(data, dict) and 'response' in data:
        data = data['response']

    status = data.get('status', {})
    if status.get('code') != 200:
        return HttpResponseRedirect(invalid_url)

    request.session['publicstuff_auth_data'] = data

    return HttpResponseRedirect(callback_url)


publicstuff_invalid_login_view = TemplateView.as_view(template_name='publicstuff_tools/invalid_login.html')