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
	var file = path.join(REPORT_DIR, path.basename(String(req.query.file || '')))
	if (!file.startsWith(REPORT_DIR + path.sep)) return res.status(400).json({ error: 'Bad file' })
	res.sendFile(file)
}

// Find users for the report filter.
module.exports.searchReportUsers = function (req, res) {
	db.sequelize.query("SELECT id, login, email FROM Users WHERE login LIKE ?", { replacements: ['%' + String(req.query.q || '') + '%'], type: db.sequelize.QueryTypes.SELECT })
		.then(rows => res.json(rows))
		.catch(err => res.status(500).json({ error: err.message }))
}

// After an export, send the user back where they came from.
module.exports.afterExport = function (req, res) {
	var next = String(req.query.next || '/app/reports/export')
	// only a path on this site: never another host
	res.redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/app/reports/export')
}
