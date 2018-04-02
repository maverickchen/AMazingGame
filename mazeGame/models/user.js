// db.js - some interface for mySQL database calls
var db = require('../db.js')

exports.create = function(username, password, email, done) {
    var values = [username, password, email, 0]
    db.get().query('INSERT INTO users (username, password, email, numWins) VALUES(?, ?, ?, ?)', values, function(err,result) {
        if (err) return done(err)
        done(null, result.insertId)
    })
}

exports.get = function(username, done) {
  db.get().query('SELECT * FROM users WHERE username = ?', username, function (err, rows) {
    if (err) return done(err)
    done(null, rows)
  })
}

exports.updateEmail = function(username, newEmail, done) {
    db.get().query('UPDATE users SET email = ?,  WHERE username = ?', newEmail, username, function (err,rows) {
        if (err) return done(err);
    });
};

exports.updateUsername = function(oldUsername, newUsername,done) {
    db.get().query('UPDATE users SET username = ?,  WHERE username = ?', newUsername, oldUsername, function (err,rows) {
        if (err) return done(err);
    });
};

exports.updateNumWins = function(username, numWins, newUsername,done) {
    db.get().query('UPDATE users SET numWins = ?,  WHERE username = ?', numWins, username, function (err,rows) {
        if (err) return done(err);
    });
};