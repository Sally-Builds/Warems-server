const Pickup = require('../models/pickupModel');
const Picker = require('../models/pickerModel');
const APIFeatures = require('../utils/apiFeature');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//create Blog
exports.createPickup = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.clientPhone) req.body.clientPhone = req.user.phone;
  if (!req.body.clientName) req.body.clientName = req.user.name;
  req.body.amount = Math.floor((req.body.weight * 15) / 1.2);
  const newPickup = await Pickup.create(req.body);

  // console.log(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newPickup,
    },
  });
});

//get Blog
// exports.getBlog = catchAsync(async (req, res, next) => {
//   const pickup = await Pickup.findOne({ slug: req.params.slug });

//   if (!pickup) {
//     return next(new AppError('No blog found with that slug', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       pickup,
//     },
//   });
// });

//Get all Blog
exports.getAllPickups = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Pickup.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const pickups = await features.query;
  res.status(200).json({
    status: 'success',
    results: pickups.length,
    data: {
      pickups,
    },
  });
});

//Get all Blog for admin
exports.getAllPickupsAdmin = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Pickup.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const pickups = await features.query;
  res.status(200).json({
    status: 'success',
    results: pickups.length,
    data: {
      pickups,
    },
  });
});

//Update blog
exports.updatePickup = catchAsync(async (req, res, next) => {
  const picker = await Picker.findOne({ pickupId: req.params.id });
  if (req.body.status === 'Successful') {
    if (picker.pickupStatus !== 'Successful') {
      return next(
        new AppError('Pickup Agent must first mark as Successfull', 404)
      );
    }
  }
  const pickup = await Pickup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!pickup) {
    return next(new AppError('No pickup found with that slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      pickup,
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
