from django.db import models


class Neighborhood (models.Model):
    name = models.CharField(max_length=100)
    tag = models.OneToOneField('alexander.ContentTag')
    center_lat = models.FloatField()
    center_lng = models.FloatField()
    description = models.TextField()
