from django.contrib import admin
from .models import Feed, ContentItem, ContentTag


class ContentItemAdmin (admin.ModelAdmin):
    list_display = ('__unicode__', 'displayed_from', 'category', 'feed')
    list_filter = ('category', 'tags', 'feed')
    search_fields = ('title',)


class FeedAdmin (admin.ModelAdmin):
    list_display = ('__unicode__', 'is_trusted', 'source_type', 'default_category',)
    list_editable = ('is_trusted',)


admin.site.register(Feed, FeedAdmin)
admin.site.register(ContentItem, ContentItemAdmin)
admin.site.register(ContentTag)
