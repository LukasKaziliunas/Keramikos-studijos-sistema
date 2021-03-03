var mysql = require('mysql');

// returns only one item (first item in an array)
exports.get = function (query) {

  const connection = connect();

  return new Promise(function (resolve, reject) {

    connection.query(query, function (error, results, fields) {
      connection.destroy();
      if (error) {
        reject("mysql error : line 13");
      } else {
        var resultJson = Object.values(JSON.parse(JSON.stringify(results)))
        resolve(resultJson[0]);
      }
    })
  });
};

// returns raw result
exports.query = function (query) {

  const connection = connect();

  return new Promise(function (resolve, reject) {

    connection.query(query, function (error, results, fields) {
      connection.destroy();
      if (error) {
        reject("mysql error : line 32");
      } else {
        var resultJson = Object.values(JSON.parse(JSON.stringify(results)))
        resolve(resultJson);
      }
    })
  });
};

// returns inserted item's id
exports.insert = function (query) {

  const connection = connect();

  return new Promise(function (resolve, reject) {

    connection.query(query, function (error, results, fields) {
      connection.destroy();
      if (error) {
        reject("mysql error : line 51");
      } else {
        resolve(results.insertId);
      }
    })
  });
};



function connect() {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'keramika',
    multipleStatements: true
  });

  return connection;
}


