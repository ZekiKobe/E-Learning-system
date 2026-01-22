import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (err: any, user?: any) => void
      ) => {
        try {
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          if (!email) {
            return done(new Error('No email returned from Google'));
          }

          let user = await User.findOne({ where: { email } });

          if (!user) {
            const firstName = profile.name?.givenName || 'Google';
            const lastName = profile.name?.familyName || 'User';
            const avatar = profile.photos && profile.photos[0] && profile.photos[0].value;

            // Random password; user will normally log in via Google
            const randomPassword = Math.random().toString(36).slice(-12);

            user = await User.create({
              email,
              password: randomPassword,
              firstName,
              lastName,
              role: UserRole.STUDENT,
              avatar,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
} else {
  // eslint-disable-next-line no-console
  console.warn(
    'Google OAuth not configured: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET are missing.'
  );
}

export default passport;


