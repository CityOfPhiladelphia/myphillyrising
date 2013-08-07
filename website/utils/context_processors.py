from django.conf import settings as djangosettings


def settings(request):
    return {'settings': djangosettings}