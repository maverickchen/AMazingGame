// db.js - some interface for mySQL database calls
var db = require('../db.js')

exports.create = function(username, password, email, done) {
    var values = [username, password, email]
    db.get().query('INSERT INTO users (username, password, email) VALUES(?, ?, ?)', values, function(err,result) {
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