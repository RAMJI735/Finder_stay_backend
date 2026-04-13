/***
 * @description Middleware to authenticate user before allowing access to protected routes.user login hai ya nhi
 */
export const authUser = async (request, reply) => {
  if (!request.isAuthenticated()) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
};


