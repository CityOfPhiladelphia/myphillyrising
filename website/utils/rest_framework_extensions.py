class ManyToNativeMixin (object):
    def many_to_native(self, value):
        return [self.to_native(item) for item in value]

    def field_to_native(self, obj, field_name):
        """
        Override default so that the serializer can be used as a nested field
        across relationships.
        """
        from rest_framework.serializers import (
            ObjectDoesNotExist, get_component, is_simple_callable, Page, six)

        if self.source == '*':
            return self.to_native(obj)

        try:
            source = self.source or field_name
            value = obj

            for component in source.split('.'):
                value = get_component(value, component)
                if value is None:
                    break
        except ObjectDoesNotExist:
            return None

        if is_simple_callable(getattr(value, 'all', None)):
            return self.many_to_native(value.all())

        if value is None:
            return None

        if self.many is not None:
            many = self.many
        else:
            many = hasattr(value, '__iter__') and not isinstance(value, (Page, dict, six.text_type))

        if many:
            return self.many_to_native(value)
        return self.to_native(value)

    @property
    def data(self):
        """
        Returns the serialized data on the serializer.
        """
        from rest_framework.serializers import (
            warnings, Page)

        if self._data is None:
            obj = self.object

            if self.many is not None:
                many = self.many
            else:
                many = hasattr(obj, '__iter__') and not isinstance(obj, (Page, dict))
                if many:
                    warnings.warn('Implict list/queryset serialization is deprecated. '
                                  'Use the `many=True` flag when instantiating the serializer.',
                                  DeprecationWarning, stacklevel=2)

            if many:
                self._data = self.many_to_native(obj)
            else:
                self._data = self.to_native(obj)

        return self._data
