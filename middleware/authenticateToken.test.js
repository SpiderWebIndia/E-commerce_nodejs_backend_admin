const jwt = require('jsonwebtoken');
const authenticateToken = require('./authenticateToken'); // adjust the path as needed

jest.mock('jsonwebtoken'); // Mock the jwt module

describe('authenticateToken Middleware', () => {
    const SECRET_KEY = 'tinkukumar.arena@gmail.com';

    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if the token is missing', () => {
        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ message: "Access token missing" });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if the token is invalid or expired', () => {
        req.headers['authorization'] = 'Bearer invalidtoken';

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error("Invalid token"), null); // Simulate a verification error
        });

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ message: "Invalid or expired token" });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if the token is valid', () => {
        const mockUser = { id: 1, name: "Test User" };
        req.headers['authorization'] = 'Bearer validtoken';

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser); // Simulate a successful verification
        });

        authenticateToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith("validtoken", SECRET_KEY, expect.any(Function));
        expect(req.user).toEqual(mockUser); // Check if user data is attached to req object
        expect(next).toHaveBeenCalled(); // Ensure the next middleware function is called
    });
});
