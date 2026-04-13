const fastify = require('fastify')({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
})

const session = require('@fastify/session')
const cookie = require('@fastify/cookie')
const passport = require('@fastify/passport')
const { Strategy } = require('passport-local');

const connectDB = require('./database')
const User = require('./model/user.model')
const LocalStrategy = require('passport-local').Strategy
const loginRoute = require('./routes/login.route');
const { BookingRoute } = require('./routes/booking.route');
connectDB()

fastify.register(cookie)
fastify.register(session, {
  secret: 'a secret with minimum length of 32 characters',
  resave: false,
  saveUninitialized: false,
   cookie: {
    secure: false,      // localhost ke liye
    sameSite: 'lax',    // ✅ correct
    httpOnly: true
  }
})
fastify.register(passport.initialize());
fastify.register(passport.secureSession());

// const fastify = require('fastify')({
//   logger: {
//     level: 'info'
//   }
// })


/***
 * @description: This is the local strategy for authenticating users with a username and password.
 * It uses the User.authenticate() method to verify the user's credentials.
 * info: Jab user login karta hai, to ye strategy call hoti hai, aur User.authenticate() method se username aur password verify karta hai. Agar credentials sahi hote hain, to user authenticate ho jata hai, aur uska data session me store ho jata hai.
 * 
 *@description login jaise call hota h ye req,body se username aur password leta hai, aur User.authenticate() method se verify karta hai. Agar credentials sahi hote hain, to user authenticate ho jata hai, aur uska data session me store ho jata hai.
 * 
 * yaha sif username bhi use kr skte  h ki usernameField: 'email' kr de, aur login me email bheje, to email se bhi login kr skte h, ya dono se bhi login kr skte h, dono field ko usernameField me de skte h, aur User.authenticate() method me bhi dono field ko verify krne ke liye code likhna padega.
 */
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  User.authenticate()
));

/***
 * @description: serialize user data for session storage
 * @description: login hone pe ye function call hoga, user ka data serialize karke session me store karega, aur cookie me session id store karega
 */
passport.registerUserSerializer(async (user, request) => {
  return user._id;
});


/***
 * @description: give data after login , we can access this data in request.user , storing data in session and cookie
 */
passport.registerUserDeserializer(async (id, request) => {
  return User.findById(id);
});


const PORT=3000

fastify.register(require("@fastify/cors"), {
  origin: true,
  credentials: true
});

fastify.get('/',(request,reply)=>{
    console.log(request.user,"hello")
    reply.send({message:'Hello World'})
})



// login route
fastify.register(loginRoute,{ prefix: '/auth' })

// hotel route
fastify.register(require('./routes/hotel.route'),{ prefix: '/hotel' });
// room
fastify.register(require('./routes/Listing.route'),{ prefix: '/room' });
fastify.register(BookingRoute,{ prefix: '/book' });




fastify.listen({ port: PORT }, (err) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server is running on port ${PORT}`)
})