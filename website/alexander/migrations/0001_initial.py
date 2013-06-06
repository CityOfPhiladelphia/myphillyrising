# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Feed'
        db.create_table(u'alexander_feed', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('last_read_at', self.gf('django.db.models.fields.DateTimeField')(null=True)),
            ('source_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('source_type', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('default_category', self.gf('django.db.models.fields.CharField')(max_length=20)),
        ))
        db.send_create_signal(u'alexander', ['Feed'])

        # Adding model 'ContentItem'
        db.create_table(u'alexander_contentitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('updated_at', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=160, null=True)),
            ('source_feed', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['alexander.Feed'])),
            ('source_id', self.gf('django.db.models.fields.CharField')(max_length=1000)),
            ('source_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('source_posted_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('source_content', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal(u'alexander', ['ContentItem'])

        # Adding M2M table for field tags on 'ContentItem'
        m2m_table_name = db.shorten_name(u'alexander_contentitem_tags')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('contentitem', models.ForeignKey(orm[u'alexander.contentitem'], null=False)),
            ('contenttag', models.ForeignKey(orm[u'alexander.contenttag'], null=False))
        ))
        db.create_unique(m2m_table_name, ['contentitem_id', 'contenttag_id'])

        # Adding model 'ContentTag'
        db.create_table(u'alexander_contenttag', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('label', self.gf('django.db.models.fields.CharField')(max_length=100)),
        ))
        db.send_create_signal(u'alexander', ['ContentTag'])


    def backwards(self, orm):
        # Deleting model 'Feed'
        db.delete_table(u'alexander_feed')

        # Deleting model 'ContentItem'
        db.delete_table(u'alexander_contentitem')

        # Removing M2M table for field tags on 'ContentItem'
        db.delete_table(db.shorten_name(u'alexander_contentitem_tags'))

        # Deleting model 'ContentTag'
        db.delete_table(u'alexander_contenttag')


    models = {
        u'alexander.contentitem': {
            'Meta': {'object_name': 'ContentItem'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'source_content': ('django.db.models.fields.TextField', [], {}),
            'source_feed': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['alexander.Feed']"}),
            'source_id': ('django.db.models.fields.CharField', [], {'max_length': '1000'}),
            'source_posted_at': ('django.db.models.fields.DateTimeField', [], {}),
            'source_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['alexander.ContentTag']", 'symmetrical': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '160', 'null': 'True'}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        u'alexander.contenttag': {
            'Meta': {'object_name': 'ContentTag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'alexander.feed': {
            'Meta': {'object_name': 'Feed'},
            'default_category': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_read_at': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'source_type': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'source_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['alexander']