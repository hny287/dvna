var path = require('path')
var execFile = require('child_process').execFile
var db = require('../models')

var REPORT_DIR = path.join(__dirname, '..', 'reports')

// Archive the named report folder.
module.exports.exportReport = function (req, res) {
	var archive = path.join('/tmp', path.basename(String(req.query.name || 'report')) + '.tgz')
	execFile('tar', ['-czf', archive, REPORT_DIR], function (err) {
		if (err) return res.status(500).json({ error: err.message })
		res.json({ archive: archive })
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

// After an export, send the user back where they came from.
module.exports.afterExport = function (req, res) {
	res.redirect(req.query.next)
}
