export function ApiResponse(reply,{statusCode = 200,  data = null,message = '',success = true }) {
    return reply.status(statusCode).send({ success, message, data });
}