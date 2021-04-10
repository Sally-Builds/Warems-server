const express = require('express');
const pickerController = require('../controller/pickerController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.protect);

router.patch(
  '/updatepickupStatus/:id',
  authController.restrictTo('pickup'),
  pickerController.updatePickupStatus
);

// router.use(authController.restrictTo('admin'));
router.patch(
  '/updatedropoffstatus/:id',
  authController.restrictTo('admin'),
  pickerController.updatedropOfStatus
);

router
  .route('/')
  // .post(authController.restrictTo('admin'), pickerController.createPicker)
  .post(pickerController.createPicker)
  .get(pickerController.getAllPickers);
//   .delete(
//     userController.getAllUsers);

// router
//   .route('/:id')
//   .delete(
//     userController.deleteUser)
//   .get(blogController.getBlog);

module.exports = router;
