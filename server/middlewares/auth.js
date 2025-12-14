const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// Auth0 configuration
const authConfig = {
  domain: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE
};

// Create middleware to validate JWT tokens
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${authConfig.domain}.well-known/jwks.json`
  }),
  audience: authConfig.audience,
  issuer: authConfig.domain,
  algorithms: ['RS256'],
  credentialsRequired: true
});

// Middleware to extract user information from JWT
const extractUser = (req, res, next) => {
  try {
    if (req.auth) {
      // Extract user information from the JWT payload
      req.user = {
        sub: req.auth.sub,
        email: req.auth.email || req.auth[`${authConfig.audience}/email`],
        name: req.auth.name || req.auth[`${authConfig.audience}/name`],
        picture: req.auth.picture || req.auth[`${authConfig.audience}/picture`],
        email_verified: req.auth.email_verified || req.auth[`${authConfig.audience}/email_verified`]
      };
    }
    next();
  } catch (error) {
    console.error('Error extracting user from JWT:', error);
    res.status(401).json({ error: 'Invalid token payload' });
  }
};

// Optional authentication - allows both authenticated and unauthenticated requests
const optionalAuth = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${authConfig.domain}.well-known/jwks.json`
  }),
  audience: authConfig.audience,
  issuer: authConfig.domain,
  algorithms: ['RS256'],
  credentialsRequired: false
});

// Middleware to check if user owns a resource
const checkResourceOwnership = (resourceField = 'creator') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // This middleware should be used after fetching the resource
    // The resource should be available in req.resource or a similar field
    const resource = req.resource || req.course || req.module || req.lesson;

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if the user owns the resource
    if (resource[resourceField] !== req.user.sub) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to access this resource.'
      });
    }

    next();
  };
};

// Error handler for JWT errors
const handleAuthError = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    const message = err.code === 'invalid_token'
      ? 'Invalid token'
      : 'No authorization token was found';

    return res.status(401).json({
      error: 'Unauthorized',
      message: message,
      code: err.code
    });
  }
  next(err);
};

// Middleware to validate Auth0 configuration
const validateAuthConfig = (req, res, next) => {
  // If we are in mock mode, just proceed
  if (!process.env.AUTH0_ISSUER || !process.env.AUTH0_AUDIENCE) {
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Auth0 configuration is missing'
    });
  }
  next();
};

// Check if we should use mock auth
const useMockAuth = !process.env.AUTH0_ISSUER || !process.env.AUTH0_AUDIENCE;

if (useMockAuth) {
  console.log('⚠️  Auth0 configuration missing. Using MOCK Authentication. All requests will be treated as authenticated.');

  const mockMiddleware = (req, res, next) => {
    req.user = {
      sub: 'auth0|mock-user-id',
      email: 'guest@example.com',
      name: 'Guest User',
      picture: 'https://via.placeholder.com/150',
      email_verified: true
    };
    req.auth = req.user;
    next();
  };

  module.exports = {
    checkJwt: mockMiddleware,
    extractUser: mockMiddleware,
    optionalAuth: mockMiddleware,
    checkResourceOwnership: () => (req, res, next) => next(), // Always allow ownership
    handleAuthError: (err, req, res, next) => next(err),
    validateAuthConfig,
    requireAuth: [validateAuthConfig, mockMiddleware],
    optionalAuthFlow: [validateAuthConfig, mockMiddleware]
  };
} else {
  module.exports = {
    checkJwt,
    extractUser,
    optionalAuth,
    checkResourceOwnership,
    handleAuthError,
    validateAuthConfig,
    requireAuth: [validateAuthConfig, checkJwt, extractUser],
    optionalAuthFlow: [validateAuthConfig, optionalAuth, extractUser]
  };
}
