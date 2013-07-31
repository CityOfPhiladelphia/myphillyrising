# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Neighborhood'
        db.create_table(u'myphillyrising_neighborhood', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('tag', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['alexander.ContentTag'], unique=True)),
            ('center_lat', self.gf('django.db.models.fields.FloatField')()),
            ('center_lng', self.gf('django.db.models.fields.FloatField')()),
            ('description', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal(u'myphillyrising', ['Neighborhood'])


    def backwards(self, orm):
        # Deleting model 'Neighborhood'
        db.delete_table(u'myphillyrising_neighborhood')


    models = {
        u'alexander.contenttag': {
            'Meta': {'object_name': 'ContentTag'},
            'label': ('django.db.models.fields.CharField', [], {'max_length': '100', 'primary_key': 'True'})
        },
        u'myphillyrising.neighborhood': {
            'Meta': {'object_name': 'Neighborhood'},
            'center_lat': ('django.db.models.fields.FloatField', [], {}),
            'center_lng': ('django.db.models.fields.FloatField', [], {}),
            'description': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'tag': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['alexander.ContentTag']", 'unique': 'True'})
        }
    }

    complete_apps = ['myphillyrising']