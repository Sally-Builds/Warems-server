const express = require('express');
const pickupController = require('../controller/pickupController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.protect);

// router.use(authController.restrictTo('admin'))
// router.use(authController.restrictTo('user'));

router.get(
  '/allpickups',
  authController.restrictTo('admin'),
  pickupController.getAllPickupsAdmin
);

router
  .route('/')
  .post(authController.restrictTo('user'), pickupController.createPickup)
  .get(pickupController.getAllPickups);
//   .delete(
//     userController.getAllUsers);

router
  .route('/:id')
  .patch(authController.restrictTo('user'), pickupController.updatePickup);

module.exports = router;
