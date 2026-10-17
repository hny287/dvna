"use strict";

module.exports = function (sequelize, DataTypes) {
    var Coupon = sequelize.define("Coupon", {
        code: { type: DataTypes.STRING, primaryKey: true },
        percentOff: { type: DataTypes.INTEGER, allowNull: false },
        singleUse: { type: DataTypes.BOOLEAN, defaultValue: true },
        used: { type: DataTypes.BOOLEAN, defaultValue: false }
    });
    return Coupon;
};
