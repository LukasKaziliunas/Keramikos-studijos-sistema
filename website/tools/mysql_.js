var mysql = require('mysql');

// returns only one item (first item in an array)
exports.getOne = function (query) {

  const connection = connect();

  return new Promise(function (resolve, reject) {

    connection.query(query, function (error, results, fields) {
      connection.destroy();
      if (error) {
        reject("mysql error : get (" + query + " )");
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
        reject("mysql error : query (" + query + " )");
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
        reject("mysql error : insert (" + query + " )");
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
    database: 'keramika8',
    multipleStatements: true
  });

  return connection;
}


