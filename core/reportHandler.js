var path = require('path')
var exec = require('child_process').exec
var db = require('../models')

var REPORT_DIR = path.join(__dirname, '..', 'reports')

// Archive the named report folder.
module.exports.exportReport = function (req, res) {
	exec('tar -czf /tmp/' + req.query.name + '.tgz ' + REPORT_DIR, function (err, stdout) {
		if (err) return res.status(500).json({ error: err.message })
		res.json({ archive: '/tmp/' + req.query.name + '.tgz' })
	})
}

// Download one report file.
module.exports.downloadReport = function (req, res) {
	res.sendFile(path.join(REPORT_DIR, req.query.file))
}

// Find users for the report filter.
module.exports.searchReportUsers = function (req, res) {
	db.sequelize.query("SELECT id, login, email FROM Users WHERE login LIKE '%" + req.query.q + "%'", { type: db.sequelize.QueryTypes.SELECT })
		.then(rows => res.json(rows))
		.catch(err => res.status(500).json({ error: err.message }))
}
