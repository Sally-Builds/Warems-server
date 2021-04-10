const mongoose = require('mongoose');
const User = require('./userModel');

const pickupSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, 'Please provide a pickup Location'],
      // unique: true,
    },
    weight: {
      type: Number,
      required: [true, 'Please you have to provide the weight of the waste'],
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Approved', 'Successful'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the cost of the waste'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    pickerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Picker',
    },
    clientName: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    clientPhone: {
      type: String,
      required: [true, 'Please provide your phone number'],
    },
    pickupAgentName: {
      type: String,
      // required: [true, 'Please provide your name'],
    },
    pickupAgentPhone: {
      type: String,
      // required: [true, 'Please provide your phone number'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pickupSchema.statics.fundAccount = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { user: userId, status: 'Successful' },
    },
    {
      $group: {
        _id: 'user',
        accountBalance: { $sum: '$amount' },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userId, {
      balance: stats[0].accountBalance,
    });
  }
};

pickupSchema.post('save', function () {
  if (this.status === 'Successful') {
    this.constructor.fundAccount(this.user);
  }
});

pickupSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

pickupSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.fundAccount(this.r.user);
});

const Pickup = mongoose.model('Pickup', pickupSchema);
module.exports = Pickup;
