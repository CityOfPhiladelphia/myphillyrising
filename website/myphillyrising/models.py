from django.db import models
from django.contrib.auth import get_user_model


class Neighborhood (models.Model):
    name = models.CharField(max_length=100)
    tag = models.OneToOneField('alexander.ContentTag')
    center_lat = models.FloatField()
    center_lng = models.FloatField()
    description = models.TextField()

    def __unicode__(self):
        return self.name


User = get_user_model()
