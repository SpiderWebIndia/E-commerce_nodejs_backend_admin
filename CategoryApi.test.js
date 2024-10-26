const request = require('supertest');
const express = require('express');

const CategoryApi = require('./CategoryApi');
const CategorySchema = require('./Schema/Category');
const authenticateToken = require('./middleware/authenticateToken');

jest.mock('./Schema/Category'); // Mock the CategorySchema model
jest.mock('./middleware/authenticateToken'); // Mock the authentication middleware

const app = express();
app.use(express.json());
app.use('/api/categorys', CategoryApi); // Corrected prefix with leading '/'

describe('Category API Endpoints', () => {

    beforeAll(() => {
        authenticateToken.mockImplementation((req, res, next) => next()); // Mock authentication
    });


    describe('POST /api/categorys/CategoryAdd', () => {
        it('should add a new category if it does not exist', async () => {
            const mockCategory = { categoryName: "Electronics" };
            CategorySchema.findOne.mockResolvedValue(null);
            CategorySchema.prototype.save.mockResolvedValue(mockCategory);
            const response = await request(app)
                .post('/api/categorys/CategoryAdd')
                .send(mockCategory);

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("Category inserted successfully");
            expect(response.body.insertedData).toEqual(mockCategory);
        });

        it('should return 400 for duplicate category', async () => {
            const mockCategory = { categoryName: "Electronics" };
            CategorySchema.findOne.mockResolvedValue(mockCategory);

            const response = await request(app)
                .post('/api/categorys/CategoryAdd')
                .send(mockCategory);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Duplicate Category. This Category already exists.");
        });

        it('should return 500 on error', async () => {
            const mockCategory = {
                categoryName: "Test Category2",
                categoryDiscription: "Test Description2",
                isDeleted: false
            };
            // Mock the findOne method to throw an error
            CategorySchema.findOne.mockImplementation(() => {
                throw new Error("Database error");
            });
            const response = await request(app)
                .post('/api/categorys/CategoryAdd')
                .send(mockCategory);
            expect(response.statusCode).toBe(500);
            expect(response.text).toBe("Internal Server Error");
        });

    });

    describe('GET /api/categorys/categoryList', () => {
        it('should fetch category list successfully', async () => {
            const mockCategories = [{ categoryName: "Electronics" }, { categoryName: "Books" }];
            CategorySchema.find.mockResolvedValue(mockCategories);

            const response = await request(app).get('/api/categorys/categoryList');
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Category Data Fetch Successfully");
            expect(response.body.data).toEqual(mockCategories);
        });

        it('should return 500 on error', async () => {
            CategorySchema.find.mockImplementation(() => {
                throw new Error("Database error");
            });
            const response = await request(app).get("/api/categorys/categoryList");
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe("Error fetching category list");
        });
    });

    describe('GET /api/categoryGetById/:id', () => {
        it('Should fetch details from particular category if found', async () => {
            const mockCategory = {
                _id: "507f1f77bcf86cd799439011",
                categoryName: "Teen Wear",
                categoryDiscription: "Testing teen",
                isDeleted: false,
            }
            CategorySchema.findOne.mockResolvedValue(mockCategory);

            const response = await request(app).get('/api/categorys/categoryGetById/507f1f77bcf86cd799439011');
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Category Details Successfully");
            expect(response.body.data).toEqual(mockCategory);
        });

        it("Should fetch deatisl if category not found", async () => {

            CategorySchema.findOne.mockResolvedValue(null);

            const response = await request(app).get('/api/categorys/categoryGetById/507f1f77bcf86cd799439011');
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Category Not Found");
            expect(response.body.status).toBe(false);

        });

        it("Should return 500 if database error", async () => {

            CategorySchema.findOne.mockImplementation(() => {
                throw new Error("Database Error");
            });

            const response = await request(app).get('/api/categorys/categoryGetById/507f1f77bcf86cd799439011');
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe("Error fetching Category");
        });
    });

    // soft delete 

    describe("DELETE /api/categorys/CategoryDelete/:id", () => {

        it('should soft delete a cateogry if found', async () => {
            const mockCategory = {
                _id: "507f1f77bcf86cd799439011",
                categoryName: "Teen Wear",
                categoryDiscription: "Testing teen",
                isDeleted: false,
            };
            CategorySchema.findByIdAndUpdate.mockResolvedValue(mockCategory);

            const response = await request(app).delete('/api/categorys/CategoryDelete/507f1f77bcf86cd799439011');
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Category soft-deleted successfully");
            expect(response.body.status).toBe(true);
            expect(response.body.deletedData).toEqual(mockCategory);

        });

        it("Write test cases if id not found", async () => {

            CategorySchema.findByIdAndUpdate.mockResolvedValue(null);

            const response = await request(app).delete('/api/categorys/CategoryDelete/507f1f77bcf86cd799439011');
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Category not found");
            expect(response.body.status).toBe(false);

        });


        it("Write test cases if database error 500", async () => {

            CategorySchema.findByIdAndUpdate.mockImplementation(() => {
                throw new Error("Database Error");
            });

            const response = await request(app).delete('/api/categorys/CategoryDelete/507f1f77bcf86cd799439011');
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe("Error deleting Category");
        })


        it("if id not correct", async () => {
            const response = await request(app).delete('/api/categorys/CategoryDelete/507f1f77bcf86cd79943903rr');
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Invalid ID format");
        });

    });

    describe("PUT /api/CategoryUpdate/:id", () => {

        it("should update category if found", async () => {

            const updateCategory = {
                _id: "507f1f77bcf86cd799439011",
                categoryName: "Teen Wear",
                categoryDiscription: "Testing teen",
            };

            CategorySchema.findByIdAndUpdate.mockResolvedValue(updateCategory);

            const response = await request(app).put("/api/categorys/CategoryUpdate/507f1f77bcf86cd799439011").send({
                categoryName: "Teen Wear",
                categoryDiscription: "Testing teen",
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Category updated successfully");
            expect(response.body.status).toBe(true);
            expect(response.body.updatedData).toEqual(updateCategory);

        });

        it("should return 404 if category not found", async () => {

            CategorySchema.findByIdAndUpdate.mockResolvedValue(null);

            const response = await request(app).put("/api/categorys/CategoryUpdate/507f1f77bcf86cd799439011").send({
                categoryName: "Teen Wear",
                categoryDiscription: "Testing teen",
            });
            expect(response.statusCode).toBe(404);
            expect(response.body.status).toBe(false);
            expect(response.body.message).toBe("Category Not Found");

        });

        it("Write test cases if database error 500", async () => {
            CategorySchema.findByIdAndUpdate.mockImplementation(() => {
                throw new Error("Database Error");
            });
            const response = await request(app).put("/api/categorys/CategoryUpdate/507f1f77bcf86cd799439011").send({
                categoryName: "Teen Wear",
                categoryDiscription: "Testing teen",
            });
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe("Error updating category");

        });


    });




});
