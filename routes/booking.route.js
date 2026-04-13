import bookingModel from "../model/booking.model.js";
import Room from "../model/room.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { authUser } from "../utils/authUser.js";


export const BookingRoute = async (fastify, options) => {

 fastify.post(
  "/rooms",
  { preHandler: authUser },
  async (request, reply) => {
    try {
      const userId = request.user._id;

      const { roomId, checkInDate, checkOutDate, guests } = request.body;

      // 🛏️ Room check
      const room = await Room.findById(roomId);
      if (!room) {
        return ApiResponse(reply, {
          statusCode: 404,
          message: "Room not found",
          data: null
        });
      }

      // 👥 Capacity check
      if (guests.adults > room.capacity.adults) {
        return ApiResponse(reply, {
          statusCode: 400,
          message: "Adult limit exceeded",
          data: null
        });
      }

      // 📅 Nights calculation
      const nights =
        (new Date(checkOutDate) - new Date(checkInDate)) /
        (1000 * 60 * 60 * 24);

      if (nights <= 0) {
        return ApiResponse(reply, {
          statusCode: 400,
          message: "Invalid dates",
          data: null
        });
      }

      // 💰 Price calculation
      let totalPrice = room.price * nights;

      // 👥 Extra guest
      if (
        guests.adults > room.capacity.adults &&
        room.extraGuestAllowed
      ) {
        const extra = guests.adults - room.capacity.adults;
        totalPrice += extra * 500; // replace with policy
      }

      // 🧾 Create booking
      const booking = await bookingModel.create({
        ...request.body,
        userId: userId,
        lockedPrice: totalPrice
      });

      return ApiResponse(reply, {
        statusCode: 201,
        message: "Booking created successfully",
        data: booking
      });

    } catch (error) {
      return ApiResponse(reply, {
        statusCode: 500,
        success: false,
        message: error.message || "Error creating booking",
        data: null
      });
    }
  }
);


fastify.get("/my-bookings", { preHandler: authUser }, async (request, reply) => {
    try {
        const userId = request.user._id;
        const bookings = await bookingModel.find({ userId }).populate({
          path: "hotelId",
          select: "name location"
        });

        return ApiResponse(reply, {
          statusCode: 200,
          message: "Bookings retrieved successfully",
          data: bookings
        });
      } catch (error) {
        return ApiResponse(reply, {
          statusCode: 500,
          success: false,
          message: error.message || "Error retrieving bookings",
          data: null
        });
      }
    });

    fastify.get("/cancel/:bookingId", { preHandler: authUser }, async (request, reply) => {
        if (!request.params.bookingId) {
          return ApiResponse(reply, {
            statusCode: 400,
            message: "Booking ID is required",
            data: null
          });
        }

        try {
            const booking = await bookingModel.findById(request.params.bookingId);
            if(booking.userId.toString() !== request.user._id.toString()) {
              return ApiResponse(reply, {
                statusCode: 403,
                message: "You are not the owner of this booking",
                data: null
              });
            }

            if (booking.bookingStatus === "cancelled") {
              return ApiResponse(reply, {
                statusCode: 400,
                message: "Booking is already cancelled",
                data: null
              });
            }


            if (!booking) {
              return ApiResponse(reply, {
                statusCode: 404,
                message: "Booking not found",
                data: null
              });
            }
            booking.bookingStatus = "cancelled";
            
            await booking.save();

            return ApiResponse(reply, {
              statusCode: 200,
              message: "Booking cancelled successfully",
              data: booking
            });
        } catch (error) {
            return ApiResponse(reply, {
                statusCode: 500,
                message: error.message || "Error cancelling booking",
                data: null
            });
        }


    });

    

}