var Db = require('tingodb')().Db,
    assert = require('assert');

var db = new Db('./', {});
// Fetch a collection to insert document into
var collection = db.collection("message_store");
// Insert a single document
// collection.insert([
//   {
  //   username: 'Lola',
  //   text: 'HELLLLLO',
  //   roomname: 'lobby'
  // }], function(err, result) {
  // assert.equal(null, err);

  // Fetch the document
  collection.findOne({
    username: 'Lola',
    text: 'HELLLLLO',
    roomname: 'lobby'
  }, function(err, item) {
    assert.equal(null, err);
    assert.equal('Lola', item.username);
  });

  collection.findOne({
    username: 'Bob',
    text: 'No such message.',
    roomname: 'lobby'
  }, function(err, item) {
    assert.equal(null, err);
    assert.equal(null, item);
  })

// });
