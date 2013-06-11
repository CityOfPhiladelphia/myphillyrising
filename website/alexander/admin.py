from django.contrib import admin
from .models import Feed, ContentItem, ContentTag

admin.site.register(Feed)
admin.site.register(ContentItem)
admin.site.register(ContentTag)
