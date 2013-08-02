var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {

  NS.UserModel = Backbone.Model.extend({
    isAuthenticated: function() {
      return !this.isNew();
    }
  });

  NS.UserCollection = A.PaginatedCollection.extend({
    url: '/api/users',
    model: NS.UserModel
  });

}(MyPhillyRising, Alexander));