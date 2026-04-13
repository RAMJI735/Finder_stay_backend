import Hotel from "../model/hotel.model.js";
import { ApiResponse } from "./ApiResponse.js";

/**
 * 
 * @description Checks if the authenticated user is the owner of the hotel
 * @param {*} request 
 * @param {*} reply 
 */
export const validOwner = async (request, reply) => {
    const userId = request.user._id;
    const hotelId = request.body.hotel 

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
        throw reply.status(404).send({ error: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== userId.toString()) {
        throw ApiResponse(reply, {
            statusCode: 403,
            success: false,
            message: 'Forbidden: You do not have permission to perform this action',
            data: null,
        });
    }
}


