const Hotel = require("../model/hotel.model");
const { ApiResponse } = require("../utils/ApiResponse");
const { authUser } = require("../utils/authUser");

const hotelSchema = {
  type: "object",
  required: ["name", "address", "city", "country"],
  properties: {
    name: { type: "string" },
    address: { type: "string" },
    city: { type: "string" },
    state: { type: "string" },
    country: { type: "string" },
    phone: { type: "string" },
    email: { type: "string", format: "email" },
    website: { type: "string", format: "uri" },
    rating: { type: "number", minimum: 0, maximum: 5 },
    description: { type: "string" },
    amenities: {
      type: "array",
      items: { type: "string" }
    },
    rooms: {
      type: "array",
      items: { type: "string" } // ObjectId as string
    },
    images: {
      type: "array",
      items: { type: "string", format: "uri" }
    },
    owner: { type: "string" }, // ObjectId as string
    location: {
      type: "object",
      required: ["type", "coordinates"],
      properties: {
        type: { type: "string", enum: ["Point"], default: "Point" },
        coordinates: {
          type: "array",
          items: { type: "number" },
          minItems: 2,
          maxItems: 2
        }
      }
    },
    policySnapshot: {
      type: "object",
      properties: {
        checkInTime: { type: "string",default: Date.now() },
        checkOutTime: { type: "string",default: Date.now() },
        earlyCheckInAllowed: { type: "boolean", default: true },
        earlyCheckInCharge: { type: "number", default: 300 },
        lateCheckOutAllowed: { type: "boolean", default: true },
        lateCheckOutCharge: { type: "number", default: 400 },
        idProofRequired: { type: "boolean", default: true },
        localIdAllowed: { type: "boolean", default: false }
      }
    }

  },
  additionalProperties: false
};


async function HotelRoute(fastify, options) {
  fastify.post(
    "/Add-hotels",
    {
      preHandler: authUser,
      schema: {
        body: hotelSchema,
      },
    },
    async (request, reply) => {
      try {
        const data = request.body;
        const hotel = await Hotel.create({ ...data, owner: request.user._id });
        return ApiResponse(reply, {
          statusCode: 201,
          message: "Hotel created successfully",
          data: hotel,
        });
      } catch (error) {

          if (error.code === 11000) {
      return reply.status(400).send({
        error: 'Hotel already exists for this user in this city'
      });
    }

        return ApiResponse(reply, {
          statusCode: 500,
          success: false,
          message: error.message || "Error creating hotel",
          data: null,
        });
      }
    },
  );

  fastify.get("/hotels", async (request, reply) => {
    try {
      const hotels = await Hotel.find().populate("owner", "username email");
      if (hotels.length === 0) {
        return ApiResponse(reply, {
          statusCode: 200,
          success: true,
          message: "No hotels found",
          data: null,
        });
      }
      return ApiResponse(reply, {
        statusCode: 200,
        message: "Hotels retrieved successfully",
        data: hotels,
      });
    } catch (error) {
      return ApiResponse(reply, {
        statusCode: 500,
        success: false,
        message: error.message || "Error retrieving hotels",
        data: null,
      });
    }
  });

fastify.get(
  "/hotels/:id",
  {
     // ✅ only middleware
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" }
        }, 
        required: ["id"]
      }
    }
  },
  async (request, reply) => {
    try {
      const hotel = await Hotel.findById(request.params.id)
        .populate("owner", "username email");

      if (!hotel) {
        return ApiResponse(reply, {
          statusCode: 404,
          success: false,
          message: "Hotel not found",
          data: null,
        });
      }

      return ApiResponse(reply, {
        statusCode: 200,
        success: true,
        message: "Hotel retrieved successfully",
        data: hotel,
      });

    } catch (error) {
      console.log(error?.stack);

      return ApiResponse(reply, {
        statusCode: 500,
        success: false,
        message: error.message || "Error retrieving hotel",
        data: null,
      });
    }
  }
);
    }

module.exports = HotelRoute;
