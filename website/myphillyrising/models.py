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
    neighborhood = models.ForeignKey('Neighborhood', null=True, blank=True, related_name='profiles')
    avatar_url = models.URLField(null=True, blank=True)
    email_permission = models.BooleanField(default=True)

    def __unicode__(self):
        return self.user.username


class UserAction (models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='actions')
    item = models.ForeignKey('alexander.ContentItem', related_name='actions', null=True, blank=True)
    points = models.IntegerField(default=0)
    type = models.CharField(max_length=32)

    def __unicode__(self):
        string = u'%s:%s' % (self.user, self.type)
        if self.item:
            string += ':%s' % (self.item,)
        return string
