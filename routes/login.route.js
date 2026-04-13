const { default: passport } = require("@fastify/passport");
const User = require("../model/user.model.js");

async function loginRoute(fastify, options) {
    fastify.post("/signup", async (request, reply) => {
    const { username, password,email,type } = request.body;
    try {
        const user = new User({ username, email, type });
        await User.register(user, password);
        reply.send({ message: 'User registered successfully' });
    } catch (error) {
        // reply.status(500).send({ error: 'Error registering user' });
        if (error.code === 11000) {
      return reply.status(400).send({
        error: 'Email already exists'
      });
    }
        reply.status(403).send({ error: error.message });
    } 
})

fastify.post("/login", 
  { preValidation: passport.authenticate('local') }, 
  async (request, reply) => {
    reply.send({
      message: 'Logged in successfully',
      user: request.user,
    });
});


/**
 * description: This route logs out the user by calling the request.logout() method, which is provided by Passport.js. It then sends a response confirming that the user has been logged out successfully.
 * logout krne ke liye request.logout() method call krna hota hai, jo Passport.js ke dwara provide kiya jata hai. Ye method user ko logout kar deta hai, aur session ko destroy kar deta hai. Uske baad ek response bheja jata hai, jisme message hota hai ki user successfully logout ho gaya hai lekin ye express mein hota h aaise callback ke through like 
 * request.logout((err) => { if (err) { return reply.status(500).send({ error: 'Error        
 * logging out' }); }.
 * 
 * info: Jab user logout karta hai, to request.logout() method call hota hai, jo user ko logout kar deta hai, aur session ko destroy kar deta hai. Uske baad ek response bheja jata hai, jisme message hota hai ki user successfully logout ho gaya hai
 */
fastify.post("/logout", async (request, reply) => {
  request.logout();   
  return reply.send({
    message: 'Logged out successfully'
  });
});

/**
 * description: This route is protected and can only be accessed by authenticated users. It returns the user's profile information.
 * If the user is not authenticated, it returns a 401 Unauthorized error.
 * The request.isAuthenticated() method is used to check if the user is logged in. If they are, their profile information is sent in the response.
 * If they are not authenticated, an error message is sent with a 401 status code.
 * This route allows users to view their profile information after logging in.
 */
fastify.get("/profile", async (request, reply) => {
    if (!request.isAuthenticated()) {
        return reply.status(401).send({ error: 'Unauthorized' });
    }
    reply.send({ user: request.user });
});
}
module.exports = loginRoute;