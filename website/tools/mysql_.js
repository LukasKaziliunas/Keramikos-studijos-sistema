var mysql = require('mysql');

// returns only one item (first item in an array)
exports.get = function (query) {

  const connection = connect();

  return new Promise(function (resolve, reject) {

    connection.query(query, function (error, results, fields) {
      connection.destroy();
      if (error) {
        reject("mysql error : get");
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
        reject("mysql error : query");
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
        reject("mysql error : insert");
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
    database: 'keramika2',
    multipleStatements: true
  });

  return connection;
}


