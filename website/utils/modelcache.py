from django.core.cache import cache
from weakref import ref as weakref
from collections import defaultdict
from operator import or_ as union


class ModelCache (object):
    def __init__(self):
        self._keys = set()
        self._keyfuncs = set()

    # ============================================================
    # Make the cache known to the model that contains it. This is
    # much like what a ModelManager does.

    def contribute_to_class(self, ModelClass, name):
        # Use weakref because of possible memory leak / circular reference.
        self._model = weakref(ModelClass)
        original_save = ModelClass.save

        def save_and_clear_cache(instance, *args, **kwargs):
            original_save(instance, *args, **kwargs)
            self.clear(instance=instance)

        setattr(ModelClass, name, self)

    @property
    def model(self):
        # Dereference the weakref; for convenience.
        return self._model()

    # ============================================================
    # Handling cache keys

    def register_key(self, key):
        if isinstance(key, (basestring, unicode)):
            self._keys.add(key)
        else:
            self._keyfuncs.add(key)

    def keys(self, instance=None):
        keys = self._keys.copy()
        if instance:
            keys.add([f(instance) for f in self._keyfuncs])
        return keys

    def get(self, *args, **kwargs):
        return cache.get(*args, **kwargs)

    def set(self, *args, **kwargs):
        return cache.set(*args, **kwargs)

    def clear(self, instance=None):
        keys = self.keys(instance)
        cache.delete_many(keys)
