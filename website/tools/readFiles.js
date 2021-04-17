var fs = require('fs');
var path = require('path');

exports.readConfig = function() {
    return new Promise(function (resolve, reject) {
        fs.readFile(path.join(__dirname, '../config.json'), 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    })
}