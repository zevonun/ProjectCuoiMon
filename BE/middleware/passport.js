// middleware/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id: googleId, emails, displayName, photos } = profile;
                const email = emails?.[0]?.value;
                const picture = photos?.[0]?.value;

                if (!email) {
                    return done(null, false, { message: 'Email không tìm thấy từ Google' });
                }

                let user = await User.findOne({ email });

                if (user) {
                    // User đã tồn tại – cập nhật googleId / avatar nếu chưa có
                    let changed = false;
                    if (!user.googleId) { user.googleId = googleId; changed = true; }
                    if (picture && !user.avatar) { user.avatar = picture; changed = true; }
                    if (changed) await user.save();
                } else {
                    // ✅ Tạo user mới – dùng 'user' nhất quán với googleAuthController
                    user = new User({
                        name: displayName,   // ✅ dùng 'name' thay vì 'displayName'
                        email,
                        googleId,
                        avatar: picture,
                        phone: '',
                        address: '',
                        password: null,
                        role: 'user',        // ✅ đã thống nhất với googleAuthController.js
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

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password -refreshToken');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;