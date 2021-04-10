// const slugify = require('slugify');
const mongoose = require('mongoose');
const Pickup = require('./pickupModel');
const User = require('./userModel');

const pickerSchema = new mongoose.Schema(
  {
    pickupId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Pickup',
    },
    amount: {
      type: Number,
      // required: [true, 'Please provide the cost of the waste'],
    },
    pickupStatus: {
      type: String,
      enum: ['Pending', 'Successful'],
      default: 'Pending',
    },
    dropOffStatus: {
      type: String,
      enum: ['Pending', 'Successful'],
      default: 'Pending',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    pickerName: {
      type: String,
    },
    pickerMobile: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pickerSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'pickupId',
    select: '-__v',
  });
  next();
});

pickerSchema.methods.updatePickup = async function (
  pickupId,
  pickerId,
  userId
) {
  const pickupAgent = await User.findById(userId);
  const data = {
    status: 'Approved',
    pickerId: pickerId,
    pickupAgentName: pickupAgent.name,
    pickupAgentPhone: pickupAgent.phone,
  };
  await Pickup.findByIdAndUpdate(pickupId, data, {
    new: true,
    runValidators: true,
  });
};

pickerSchema.statics.pickerfunds = async function (pickupId) {
  const you = await Pickup.findById(pickupId);
  return you.weight;
};

pickerSchema.pre('save', async function () {
  const weight = await this.constructor.pickerfunds(this.pickupId);
  this.amount = Math.floor((weight * 10) / 1.2);
});

pickerSchema.statics.fundAccount = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { user: userId, dropOffStatus: 'Successful' },
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

pickerSchema.post('save', function () {
  if (this.dropOffStatus === 'Successful') {
    this.constructor.fundAccount(this.user);
  }
});

pickerSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

pickerSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.fundAccount(this.r.user);
});

const Picker = mongoose.model('Picker', pickerSchema);
module.exports = Picker;
