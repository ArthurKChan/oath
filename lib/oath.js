
// Since objects only compare === to the same object (i.e. the same reference)
// we can do something like this instead of using integer enums because we can't
// ever accidentally compare these to other values and get a false-positive.
//
// For instance, `rejected === resolved` will be false, even though they are
// both {}.

// Janky ENUMS
var rejected = {}, resolved = {}, waiting = {};

// This is a promise. It's a value with an associated temporal
// status. The value might exist or might not, depending on
// the status.
var Promise = function (value, status) {
  this.value = value;
  this.status = status;
  // queue of jobs to do after success or fail of promise
  this.successCallbacks = [];
  this.failCallbacks = [];
};

// The user-facing way to add functions that want
// access to the value in the promise when the promise
// is resolved.
Promise.prototype.then = function (success, _failure) {
  var newVal;
  // push in the jobs from to do on promised values
  if(success){
    this.successCallbacks.push(success);
  };
  if(_failure){
    this.failCallbacks.push(_failure);
  };
  // then should return the instance of the promise
  return this;
};


// The user-facing way to add functions that should fire on an error. This
// can be called at the end of a long chain of .then()s to catch all .reject()
// calls that happened at any time in the .then() chain. This makes chaining
// multiple failable computations together extremely easy.
Promise.prototype.catch = function (failure) {
  // if the promise fails, it will use this failure function as a callback
  this.failure = failure;
};



// This is the object returned by defer() that manages a promise.
// It provides an interface for resolving and rejecting promises
// and also provides a way to extract the promise it contains.
var Deferred = function (promise) {
  this.promise = promise;
};

// Resolve the contained promise with data.
//
// This will be called by the creator of the promise when the data
// associated with the promise is ready.
Deferred.prototype.resolve = function (data) {
  var self = this;
  this.promise.value = data;
  this.promise.status = resolved;
  // once async-function is done, call the queued up
  // callbacks with the data as the first argument
  this.promise.successCallbacks[0](data)
};

// Reject the contained promise with an error.
//
// This will be called by the creator of the promise when there is
// an error in getting the data associated with the promise.
Deferred.prototype.reject = function (error) {
  // set the promise status to rejected
  this.promise.status = rejected;
  // use the failure callback 
  this.promise.failure(error);
};

// The external interface for creating promises
// and resolving them. This returns a Deferred
// object with an empty promise.
var defer = function () {
  return new Deferred(new Promise(undefined, waiting))
};


module.exports.defer = defer;


