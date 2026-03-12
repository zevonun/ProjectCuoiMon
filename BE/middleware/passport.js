// middleware/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// ✅ Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id: googleId, emails, displayName, photos } = profile;
                const email = emails?.[0]?.value;
                const picture = photos?.[0]?.value;

                if (!email) {
                    return done(null, false, { message: 'Email không tìm thấy từ Google' });
                }

                // Tìm user theo email
                let user = await User.findOne({ email });

                if (user) {
                    // User đã tồn tại - cập nhật googleId nếu chưa có
                    if (!user.googleId) {
                        user.googleId = googleId;
                        if (picture && !user.avatar) {
                            user.avatar = picture;
                        }
                        await user.save();
                    }
                } else {
                    // Tạo user mới (từ Google)
                    user = new User({
                        email,
                        displayName,
                        googleId,
                        avatar: picture,
                        phone: '',
                        address: '',
                        password: null, // User từ Google không cần password
                        role: 'customer'
                    });
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
