import json
from urllib import urlencode
from urllib2 import urlopen
from django.http import HttpResponseRedirect


def publicstuff_auth_view(request):
    credentials = {
        'email': request.REQUEST.get('email'),
        'password': request.REQUEST.get('password')
    }
    publicstuff_url = ('https://www.publicstuff.com/api/2.0/user_login/?' +
                       urlencode(credentials))
    callback_url = request.REQUEST.get('callback')

    publicstuff = urlopen(publicstuff_url)
    data = json.load(publicstuff)

    if isinstance(data, dict) and 'response' in data:
        data = data['response']
    request.session['publicstuff_auth_data'] = data

    return HttpResponseRedirect(callback_url)
