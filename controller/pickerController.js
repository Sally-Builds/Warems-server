const Picker = require('../models/pickerModel');
const Pickup = require('../models/pickupModel');
const User = require('../models/userModel');
// const Pickup = require('../models/pickupModel');
const APIFeatures = require('../utils/apiFeature');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//create Blog
exports.createPicker = catchAsync(async (req, res, next) => {
  //check if pickup and pickupAgent exists
  const user = await User.findById(req.body.user);
  const pickup = await Pickup.findById(req.body.pickupId);
  if (!user)
    return next(new AppError('no pickup Agent found with this id', 404));
  if (!pickup) return next(new AppError('no pickup found with this id', 404));

  if (user.role !== 'pickup')
    return next(new AppError('user must be a pickup agent', 404));

  const newPicker = await Picker.create(req.body);

  newPicker.updatePickup(newPicker.pickupId, newPicker.id, req.body.user);
  res.status(201).json({
    status: 'success',
    data: {
      newPicker,
    },
  });
});

//get Blog
// exports.getBlog = catchAsync(async (req, res, next) => {
//   const blog = await Blog.findOne({ slug: req.params.slug });

//   if (!blog) {
//     return next(new AppError('No blog found with that slug', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       blog,
//     },
//   });
// });

//Get all Blog
exports.getAllPickers = catchAsync(async (req, res, next) => {
  // const features = new APIFeatures(
  //   Picker.find({ user: req.user.id }),
  //   req.query
  // )
  const features = new APIFeatures(Picker.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const pickers = await features.query;
  // const pickers = await Picker.find();
  res.status(200).json({
    status: 'success',
    results: pickers.length,
    data: {
      pickers,
    },
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// //Update blog
exports.updatePickupStatus = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'pickupStatus');
  const status = await Picker.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  if (!status) {
    return next(new AppError('Document not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      status,
    },
  });
});

exports.updatedropOfStatus = catchAsync(async (req, res, next) => {
  const { pickupId } = req.body;
  const filteredBody = filterObj(req.body, 'dropOffStatus');
  const pickup = await Pickup.findById(pickupId);
  if (pickup.status === 'Approved')
    return next(new AppError('Client must first approve pickup', 400));
  const status = await Picker.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  if (!status) {
    return next(new AppError('Document not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      status,
    },
  });
});

// //
// exports.deleteBlog = catchAsync(async (req, res, next) => {
//   const blog = await Blog.findOneAndDelete({ slug: req.params.slug });
//   if (!blog) {
//     return next(new AppError('No blog found with that slug', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// exports.deleteAllBlog = catchAsync(async (req, res, next) => {});
