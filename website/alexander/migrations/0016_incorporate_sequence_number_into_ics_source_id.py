# -*- coding: utf-8 -*-
import datetime
import json
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):

    def forwards(self, orm):
        "Write your forwards methods here."
        modified_items = []

        for item in orm.ContentItem.objects.all():

            # We're only concerned with items that came from iCal feeds
            if item.feed.source_type.lower() in ('ics', 'ical'):
                content = json.loads(item.source_content)
                if 'SEQUENCE' in content:
                    item.source_id += ':%s' % (content['SEQUENCE'],)
                    modified_items.append(item)

        # Save as a separate step, in case something goes wrong.
        for item in modified_items:
            item.save()

    def backwards(self, orm):
        "Write your backwards methods here."
        modified_items = []
        for item in orm.ContentItem.objects.all():
            if item.feed.source_type.lower() in ('ics', 'ical'):
                if ':' in item.source_id:
                    item.source_id = item.source_id.rsplit(':', 1)[0]
                    modified_items.append(item)

        for item in modified_items:
            item.save()

    models = {
        u'alexander.contentitem': {
            'Meta': {'ordering': "('-displayed_from',)", 'object_name': 'ContentItem'},
            'address': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '1000', 'blank': 'True'}),
            'category': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'displayed_from': ('django.db.models.fields.DateTimeField', [], {}),
            'displayed_until': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'feed': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'to': u"orm['alexander.Feed']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_featured': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'lat': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'lng': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'source_content': ('django.db.models.fields.TextField', [], {}),
            'source_id': ('django.db.models.fields.CharField', [], {'max_length': '1000'}),
            'source_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'pending'", 'max_length': '20'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'items'", 'symmetrical': 'False', 'to': u"orm['alexander.ContentTag']"}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '160', 'null': 'True', 'blank': 'True'}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        u'alexander.contenttag': {
            'Meta': {'object_name': 'ContentTag'},
            'label': ('django.db.models.fields.CharField', [], {'max_length': '100', 'primary_key': 'True'})
        },
        u'alexander.feed': {
            'Meta': {'object_name': 'Feed'},
            'default_category': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'default_tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['alexander.ContentTag']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_trusted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_read_at': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'source_type': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'source_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['alexander']
    symmetrical = True
