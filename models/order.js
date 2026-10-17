"use strict";

module.exports = function (sequelize, DataTypes) {
    var Order = sequelize.define("Order", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        productId: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        unitPrice: { type: DataTypes.FLOAT, allowNull: false },
        total: { type: DataTypes.FLOAT, allowNull: false },
        coupon: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING, defaultValue: 'placed' }
    });
    return Order;
};
