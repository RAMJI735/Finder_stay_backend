const Room = require("../model/room.model");
const { ApiResponse } = require("../utils/ApiResponse");
const { authUser } = require("../utils/authUser");
const { validOwner } = require("../utils/validOwner");



const roomSchema = {
    type: "object",
    required: ["hotel", "number", "type", "price"],
    properties: {
        hotel: { type: "string" }, // ObjectId as string
        number: { type: "string" },
        type: { type: "string", enum: ["Single", "Double", "Suite"] },
        price: { type: "number" },
        description: { type: "string" },
        amenities: {
            type: "array",
            items: { type: "string" }
        },
        capacity: {
            type: "object",
            required: ["adults"],
            properties: {
                adults: { type: "number", minimum: 1 },
                children: { type: "number", minimum: 0 }
            }
        },
        extraGuestAllowed: { type: "boolean", default: false },
        images: {
            type: "array",
            items: { type: "string" }
        }
    },
     additionalProperties: false
};




async function RoomRoute(fastify, options) {
    fastify.post("/Add-listing", {preHandler: [authUser, validOwner], schema: {
        body: roomSchema,
      }}, async (request, reply) => {
        try {

        const data = await Room.create({ ...request.body,owner: request?.user?._id });
        return ApiResponse(reply, {
          statusCode: 201,
          message: "Listing created successfully",
          data,
        });


        }        catch (error) {
            //    fastify.log.error(error)
                if (error.code === 11000) {
      return reply.status(400).send({
        error: 'Room already exists for this hotel'
      });
    }
            return reply.status(500).send({ error: error });
        }
    });

    fastify.get("/listings", { preHandler: authUser }, async (request, reply) => {
        try {
            const data = await Room.find().populate("hotel", "name city address");
            return ApiResponse(reply, {
                statusCode: 200,
                message: "Listings retrieved successfully",
                data,
            });
        } catch (error) {
            return ApiResponse(reply, {
                statusCode: 500,
                success: false,
                message: error.message || "Error retrieving listings",
                data: null,
            });
        }
    });

    fastify.get("/listings/:hotelId", { preHandler: authUser }, async (request, reply) => {
        try {
            const { hotelId } = request.params;
            if (!hotelId) {
              throw new Error("Hotel ID(hotelId) is required");
            }
            const data = await Room.find({ hotel: hotelId }).populate("hotel", "name city address");
            if (data.length === 0) {
                return ApiResponse(reply, {
                    statusCode: 200,
                    success: true,
                    message: "No listings found for this hotel",
                    data: null,
                });
            }
            return ApiResponse(reply, {
                statusCode: 200,
                message: "Listings retrieved successfully",
                data,
            });
        } catch (error) {
            return ApiResponse(reply, {
                statusCode: 500,
                success: false,
                message: error.message || "Error retrieving listings",
                data: null,
            });
        }
    });


    fastify.get("/listing/:id", { preHandler: authUser }, async (request, reply) => {
        try {
            const { id } = request.params;
            const data = await Room.findById(id).populate("hotel", "name city address");
            if (!data) {
                return ApiResponse(reply, {
                    statusCode: 404,
                    success: false,
                    message: "Listing not found",
                    data: null,

                });
            }
            return ApiResponse(reply, {
                statusCode: 200,
                message: "Listing retrieved successfully",
                data,
            });
        }

            catch (error) {
            return ApiResponse(reply, {
                statusCode: 500,
                success: false,
                message: error.message || "Error retrieving listing",
                data: null,
            });
        }
    });
    fastify.delete("/listings/delete/:id", { preHandler: [authUser, validOwner] }, async (request, reply) => {
        try {
            const { id } = request.params;
            const data = await Room.findByIdAndDelete(id);
            if (!data) {
                return ApiResponse(reply, {
                    statusCode: 404,
                    success: false,
                    message: "Listing not found",
                    data: null,
                });
            }
            return ApiResponse(reply, {
                statusCode: 200,
                message: "Listing deleted successfully",
                data: null,
            });
        } catch (error) {
            return ApiResponse(reply, {
                statusCode: 500,
                success: false,
                message: error.message || "Error deleting listing",
                data: null,
            });
        }
    });


}

module.exports = RoomRoute;