from django.contrib import admin
from .models import Feed, ContentItem, ContentTag


class ContentItemAdmin (admin.ModelAdmin):
    list_display = ('__unicode__', 'displayed_from', 'category', 'feed')
    list_filter = ('category', 'tags', 'feed')
    search_fields = ('title',)


admin.site.register(Feed)
admin.site.register(ContentItem, ContentItemAdmin)
admin.site.register(ContentTag)
