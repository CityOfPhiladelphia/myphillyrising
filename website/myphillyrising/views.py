from django.views.generic import TemplateView


class AppView (TemplateView):
    template_name = 'myphillyrising/index.html'

# Views
app_view = AppView.as_view()
