const bcrypt = require('bcryptjs'); // Password hashing library for secure password storage
const jwt = require('jsonwebtoken'); // JSON Web Token for authentication
const User = require('../../models/user'); // User model for authentication
const Secret = require('../../models/secret'); // Secret model for storing secrets

module.exports = {
  // Fetch all secrets for public feed
  secrets: async () => {
    try {
      const secrets = await Secret.find().sort({ createdAt: -1 }); // Fetch all secrets sorted by creation date
      return secrets.map(secret => ({
        ...secret._doc,
        _id: secret.id,
        createdAt: secret.createdAt.toISOString(),
      }));
    } catch (err) {
      throw err;
    }
  },

  // User registration
  register: async ({ email, password }, context) => {
    const { req, res } = context; // Extract request and response from context
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists.');
      }
      const hashedPassword = await bcrypt.hash(password, 12); // Hash the password 
      // Create a new user instance
      const user = new User({
        email,
        password: hashedPassword,
      });
      const result = await user.save(); // Save the user to the database

      // Create JWT token
      // Sign the token with user ID and email, using a secret key
      const token = jwt.sign(
        { userId: result.id, email: result.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store JWT in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true, // Prevent JavaScript access to the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'Lax', // Prevent CSRF attacks by restricting cookie to same-site requests
        maxAge: 3600000 // 1 hour
      });

      return { userId: result.id, token, tokenExpiration: 1 };
    } catch (err) {
      throw err;
    }
  },

  // User login
  login: async ({ email, password }, context) => {
    const { req, res } = context;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found.');
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error('Password is incorrect.');
      }

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store JWT in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 3600000 // 1 hour
      });
 
      return { userId: user.id, token, tokenExpiration: 1 };
    } catch (err) {
      throw err;
    }
  },

  // Create an anonymous secret (only for authenticated users)
  createSecret: async ({ content }, context) => {
    const { req } = context;
    // Check if the user is authenticated
    if (!req.isAuth) {
      throw new Error('Not authenticated.');
    }
    try {
      const secret = new Secret({
        content,
        creator: req.userId,
      });
      const result = await secret.save(); // Save the secret to the database
      return {
        ...result._doc,
        _id: result.id,
        createdAt: result.createdAt.toISOString(),
      };
    } catch (err) {
      throw err;
    }
  },

  // Like a secret (optional)
  likeSecret: async ({ secretId }, context) => {
    const { req } = context; // Extract request from context
    // Check if the user is authenticated
    if (!req.isAuth) {
      throw new Error('Not authenticated.');
    }
    try {
      const secret = await Secret.findById(secretId);
      if (!secret) {
        throw new Error('Secret not found.');
      }
      secret.likes += 1; // Increment the like count
      await secret.save();

      // Track liked secrets for the user if needed
      const user = await User.findById(req.userId);
      if (!user.likedSecrets.includes(secretId)) {
        user.likedSecrets.push(secretId);
        await user.save();
      }

      // Return the updated secret
      return {
        ...secret._doc,
        _id: secret.id,
        createdAt: secret.createdAt.toISOString(),
      };
    } catch (err) {
      throw err;
    }
  },

  // Logout mutation: clears the JWT cookie
  logout: async (args, context) => {
    const { res } = context; // Extract response from context
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      expires: new Date(0), // Expire the cookie immediately
    });
    return true;
  },

  // Check if user is authenticated
  isAuthenticated: async (args, context) => {
    const { req } = context;
    return !!req.isAuth;
  },

  // Edit a secret (only for authenticated users)
  editSecret: async ({ secretId, content }, context) => {
    const { req } = context; // Extract request from context
    // Check if the user is authenticated
    if (!req.isAuth) {
      throw new Error('Not authenticated.');
    }
    try {
      const secret = await Secret.findById(secretId);
      if (!secret) {
        throw new Error('Secret not found.');
      }
      // Check if the user is the creator of the secret
      if (String(secret.creator) !== String(req.userId)) {
        throw new Error('You are not authorized to edit this secret.');
      }
      secret.content = content;
      await secret.save();
      return {
        ...secret._doc,
        _id: secret.id,
        createdAt: secret.createdAt.toISOString(),
      };
    } catch (err) {
      throw err;
    }
  },

  // Delete a secret (only for authenticated users)
  deleteSecret: async ({ secretId }, context) => {
    const { req } = context;
    // Check if the user is authenticated
    if (!req.isAuth) {
      throw new Error('Not authenticated.');
    }
    try {
      const secret = await Secret.findById(secretId);
      if (!secret) {
        throw new Error('Secret not found.');
      }
      // Check if the user is the creator of the secret
      if (String(secret.creator) !== String(req.userId)) {
        throw new Error('You are not authorized to delete this secret.');
      }
      await Secret.deleteOne({ _id: secretId });
      return true;
    } catch (err) {
      throw err;
    }
  },
};
