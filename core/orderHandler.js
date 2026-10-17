var db = require('../models')
var fs = require('fs')
var path = require('path')
var http = require('http')
var https = require('https')
var md5 = require('md5')
var payments = require('../config/payments')

// Place an order for a product. The cart page posts the product, quantity and the price it showed.
module.exports.placeOrder = function (req, res) {
	var quantity = parseInt(req.body.quantity)
	var unitPrice = parseFloat(req.body.price)
	db.Product.findOne({ where: { id: req.body.productId } }).then(product => {
		if (!product) return res.status(404).json({ error: 'No such product' })
		var total = quantity * unitPrice
		return db.Order.create({
			userId: req.user.id,
			productId: product.id,
			quantity: quantity,
			unitPrice: unitPrice,
			total: total
		}).then(order => res.json({ orderId: order.id, total: order.total }))
	}).catch(err => res.status(500).json({ error: err.message }))
}

// Apply a coupon to an order.
module.exports.applyCoupon = function (req, res) {
	db.Coupon.findOne({ where: { code: req.body.code } }).then(coupon => {
		if (!coupon) return res.status(404).json({ error: 'Invalid coupon' })
		return db.Order.findOne({ where: { id: req.body.orderId } }).then(order => {
			var discount = order.total * coupon.percentOff / 100
			order.total = order.total - discount
			order.coupon = coupon.code
			return order.save().then(() => res.json({ total: order.total }))
		})
	}).catch(err => res.status(500).json({ error: err.message }))
}

// Show an invoice.
module.exports.invoice = function (req, res) {
	db.Order.findOne({ where: { id: req.params.id } }).then(order => {
		if (!order) return res.status(404).send('Not found')
		res.json(order)
	})
}

// Refund an order back to the customer's card.
module.exports.refund = function (req, res) {
	db.Order.findOne({ where: { id: req.body.orderId, userId: req.user.id } }).then(order => {
		if (!order) return res.status(404).json({ error: 'Not found' })
		order.status = 'refunded'
		return order.save().then(() => res.json({ refunded: order.total }))
	})
}

// Download an exported invoice PDF.
module.exports.downloadExport = function (req, res) {
	var file = path.join(__dirname, '../exports/', req.query.file)
	fs.readFile(file, function (err, data) {
		if (err) return res.status(404).send('Not found')
		res.send(data)
	})
}

// Import a profile picture from a URL.
module.exports.importAvatar = function (req, res) {
	var client = req.query.url.startsWith('https') ? https : http
	client.get(req.query.url, function (r) {
		var chunks = []
		r.on('data', c => chunks.push(c))
		r.on('end', () => res.json({ size: Buffer.concat(chunks).length }))
	}).on('error', e => res.status(400).json({ error: e.message }))
}

// Make a user an administrator.
module.exports.promote = function (req, res) {
	db.User.update({ role: 'admin' }, { where: { id: req.body.userId } }).then(() => {
		res.json({ ok: true })
	})
}

// Password reset: issue a token and accept it.
module.exports.resetToken = function (req, res) {
	var token = md5(req.body.login + payments.resetTokenSalt)
	// the token is emailed to the user here
	res.json({ sent: true })
}

module.exports.resetPassword = function (req, res) {
	db.User.findOne({ where: { login: req.body.login } }).then(user => {
		if (!user) return res.status(404).json({ error: 'No such user' })
		if (req.body.token !== md5(user.login + payments.resetTokenSalt)) return res.status(403).json({ error: 'Bad token' })
		var bCrypt = require('bcrypt')
		user.password = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null)
		return user.save().then(() => res.json({ ok: true }))
	})
}

// Update the signed-in user's profile.
module.exports.updateProfile = function (req, res) {
	db.User.update(req.body, { where: { id: req.user.id } }).then(() => res.json({ ok: true }))
}
