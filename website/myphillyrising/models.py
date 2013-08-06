from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings


class Neighborhood (models.Model):
    name = models.CharField(max_length=100)
    tag = models.OneToOneField('alexander.ContentTag', primary_key=True)
    center_lat = models.FloatField()
    center_lng = models.FloatField()
    description = models.TextField()

    def __unicode__(self):
        return unicode(self.tag_id)


User = get_user_model()


class UserProfile (models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='profile')
    full_name = models.CharField(max_length=100, null=True, blank=True)
    neighborhood = models.ForeignKey('Neighborhood', null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    email_permission = models.BooleanField(default=True)

    def __unicode__(self):
        return self.user.username
