from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils.timezone import now, timedelta
from itertools import chain
from myphillyrising.services import CacheService


class Neighborhood (models.Model):
    name = models.CharField(max_length=100)
    tag = models.OneToOneField('alexander.ContentTag', primary_key=True)
    center_lat = models.FloatField()
    center_lng = models.FloatField()
    description = models.TextField()

    def __unicode__(self):
        return unicode(self.tag_id)

    @property
    def points(self):
        score = 0
        for profile in self.profiles.all():
            for action in profile.user.actions.all():
                # NOTE: We use a condition instead of a filter here because all
                # has been prefetched at this point.
                if action.awarded_at >= (now() - timedelta(days=30)):
                    score += action.points
        return score


User = get_user_model()
class Neighbor (User):
    class Meta:
        proxy = True

    @property
    def points(self):
        return sum(
            action.points
            for action in self.actions.all()
            # NOTE: We use a condition instead of a filter here because all
            # has been prefetched at this point.
            if action.awarded_at >= now() - timedelta(days=30)
        )


class UserProfile (models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='profile', primary_key=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    neighborhood = models.ForeignKey('Neighborhood', null=True, blank=True, related_name='profiles')
    avatar_url = models.URLField(null=True, blank=True)
    email_permission = models.BooleanField(default=True)

    def __unicode__(self):
        return self.user.username


class UserAction (models.Model):
    awarded_at = models.DateTimeField(auto_now_add=True, verbose_name='action datetime')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='actions')
    item = models.ForeignKey('alexander.ContentItem', related_name='actions', null=True, blank=True)
    points = models.IntegerField(default=0)
    type = models.CharField(max_length=32)

    def __unicode__(self):
        string = u'%s:%s' % (self.user, self.type)
        if self.item:
            string += ':%s' % (self.item,)
        return string
