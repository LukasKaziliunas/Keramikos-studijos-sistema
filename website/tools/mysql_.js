var mysql = require('mysql');


exports.select = function (query) {

  const connection = connect();

  return new Promise(function (resolve, reject) {

    connection.query(query, function (error, results, fields) {
      connection.destroy();
      if (error) reject(error);

      var resultJson = Object.values(JSON.parse(JSON.stringify(results)))
      resolve(resultJson[0]);
    })

  });

};

function connect() {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'keramika'
  });

  return connection;
}


