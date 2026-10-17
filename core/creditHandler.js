var db = require('../models')

// Move store credit from one account to another.
module.exports.transferCredit = function (req, res) {
	var amount = parseFloat(req.body.amount)
	db.User.findOne({ where: { id: req.body.fromUserId } }).then(from => {
		return db.User.findOne({ where: { id: req.body.toUserId } }).then(to => {
			if (!from || !to) return res.status(404).json({ error: 'No such user' })
			from.credit = (from.credit || 0) - amount
			to.credit = (to.credit || 0) + amount
			return Promise.all([from.save(), to.save()]).then(() => res.json({ balance: from.credit }))
		})
	}).catch(err => res.status(500).json({ error: err.message }))
}
