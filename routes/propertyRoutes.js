const express = require("express");
const {
  addProperty,
  GetProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getFilteredProperties,
  getPropertiesByStatus,
  propertyBySlug,
  getPropertiesByLocation,
  getPropertyByCity,
  getPropertiesByUserId,
  getPropertyByArea,
  updatePropertyAvailabilityStatus,
  purchaseQuery,
  getAllProperties,
} = require("../controllers/property/index.js");

const upload = require("../middlewares/multer.js");
const Property = require("../models/propertyModel.js");
const authenticate = require("../middlewares/authMiddleware.js");
//const { BASE_URL } = require("../../Tolet-Globe-Frontend/src/constant/constant.js");
// import("../../Tolet-Globe-Frontend/src/constant/constant.js").then(({ BASE_URL }) => {
//   console.log(BASE_URL);
// });

const router = express.Router();

router.route("/add-property").post(
  authenticate,
  upload.fields([
    {
      name: "images",
      maxCount: 15, // max 15 images
    },
    {
      name: "videos",
      maxCount: 5, // max 5 videos
    },
  ]),
  addProperty,
); //change names and methods according to your endpoints
//eg.

// router.route("/location/:location").get(getPropertiesByLocation);

router.route("/user/:userId").get(getPropertiesByUserId);

router.route("/filter").get(getFilteredProperties);

router.get("/status", getPropertiesByStatus);

router.get("/all", getAllProperties);

// http://localhost:8000/api/v1/property?page=2&limit=5
// router.route("/").get(GetProperty); //change names and methods according to your endpoints

router.route("/update-property/:id").patch(
  authenticate,
  upload.fields([
    { name: "images", maxCount: 15 }, // max 15 images
    { name: "videos", maxCount: 5 }, // max 5 videos
  ]),
  updateProperty,
);
// router.route("/update-property/:id").patch(updateProperty); //change names and methods according to your endpoints
router
  .route("/update-property-availability-status/:id")
  .patch(authenticate, updatePropertyAvailabilityStatus);

router.route("/:id").delete(authenticate, deleteProperty); //change names and methods according to your endpoints

router.route("/:id").get(getPropertyById); //change names and methods according to your endpoints

// router.post("/add-review", addReview);

// router.delete("/reviews/:id", deleteReview);

// Get property by slug
router.get("/slug/:slug", propertyBySlug);

router.post("/purchasequery", purchaseQuery);
// router.get("/city/:city", getPropertyByCity);

// router.get("/city/:city/:locality/:area", getPropertyByArea); //http://localhost:8000/api/v1/property/city/Lucknow/Gomti Nagar/Vishesh Khand

//e.g
// GET http://localhost:8000/api/v1/property/filter?minPrice=10000&maxPrice=20000

// GET http://localhost:8000/api/v1/property/filter?bhk=3

// GET http://localhost:8000/api/v1/property/filter?minPrice=10000&maxPrice=20000&bhk=3&locality=Hazratganj&petsAllowed=true

/*
router.route("/").delete(addProperty); //change names and methods according to your endpoints

*/
// router.put("/:id/availability", async (req, res) => {
//   try {
//     // Find property by ID
//     const property = await Property.findById(req.params.id);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }

//     // Validate status
//     const validStatuses = ["Available", "Rented Out", "NA"];
//     if (!validStatuses.includes(req.body.availabilityStatus)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     // Update status directly
//     property.availabilityStatus = req.body.availabilityStatus;
//     await property.save();

//     res.json(property);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
router.put("/:id/availability", authenticate, async (req, res) => {
  try {
    console.log("Request received to update availability status", req.body);

    const propertyId = req.params.id;
    const { availabilityStatus } = req.body;
    const requestingUserId = req.userId || req.body.userId;

    const validStatuses = ["Available", "Rented Out", "NA"];
    if (!validStatuses.includes(availabilityStatus)) {
      console.log("Invalid status received:", availabilityStatus);
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the property to check ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check authorization: Admin or Owner
    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser) {
      return res.status(404).json({ message: "Requesting user not found" });
    }

    if (
      requestingUser.role !== "admin" &&
      property.userId.toString() !== requestingUserId.toString()
    ) {
      return res.status(403).json({
        message:
          "Unauthorized! Only admin or property owner can update availability.",
      });
    }

    // Use findByIdAndUpdate instead of save() to avoid full document validation
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { availabilityStatus: availabilityStatus },
      { new: true, runValidators: false }, // new: true returns the updated document, runValidators: false skips validation
    );

    console.log("Property status updated successfully:", updatedProperty);

    res.json(updatedProperty);
  } catch (error) {
    console.error("Error updating property availability status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
