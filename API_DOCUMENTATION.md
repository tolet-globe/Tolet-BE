# To-Let Backend API Documentation

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Authentication & Security](#authentication--security)
- [Base URL](#base-url)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Property Management Endpoints](#property-management-endpoints)
- [Blog Management Endpoints](#blog-management-endpoints)
- [Review Management Endpoints](#review-management-endpoints)
- [Contact & FAQ Endpoints](#contact--faq-endpoints)
- [File Upload (AWS S3)](#file-upload-aws-s3)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Overview

The To-Let Backend is a comprehensive property rental platform API built for managing property listings, user accounts, blogs, reviews, and more. It provides a complete solution for property rental marketplace functionality with features like user authentication, property management, file uploads, and review systems.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3
- **File Upload**: Multer with Multer-S3
- **Email Service**: Nodemailer
- **SMS Service**: Twilio
- **Security**: Helmet, CORS, bcrypt for password hashing
- **Rate Limiting**: express-rate-limit
- **Additional**: Google OAuth2, CSV parsing, Cloudinary

## Authentication & Security

### Authentication Method
The API uses **JWT (JSON Web Tokens)** for authentication. Tokens are generated upon successful login and must be included in the Authorization header for protected routes.

### Token Format
```
Authorization: Bearer <your_jwt_token>
```

### Security Features
- Password hashing using bcrypt
- Rate limiting on sensitive endpoints
- CORS protection
- Helmet security headers
- Input validation
- Email and SMS verification

## Base URL

```
http://localhost:8000/api/v1
```

---

# Authentication Endpoints

## Register User
**POST** `/auth/register`

Register a new user account with email or SMS verification.

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phone": "+918408990000",
  "verificationMethod": "email"
}
```

### Response (Success)
```json
{
  "message": "Verification email sent!",
  "verificationMethod": "email"
}
```

### Response (Error)
```json
{
  "message": "A user with this email already exists."
}
```

---

## Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### Response (Success)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f7b8c9e1234567890abcde",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "isVerified": true
  }
}
```

### Response (Error)
```json
{
  "message": "Invalid credentials. Please try again."
}
```

---

## Google OAuth Login
**POST** `/auth/google-login`

Authenticate using Google OAuth token.

### Request Body
```json
{
  "token": "google_oauth_token_here"
}
```

### Response
Same as regular login response.

---

## Verify OTP
**POST** `/auth/verify-otp`

Verify SMS OTP for phone number verification.

### Request Body
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

### Response (Success)
```json
{
  "message": "Phone number verified successfully!",
  "user": {
    "id": "64f7b8c9e1234567890abcde",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

## Verify Account
**GET** `/auth/verify/:token`

Verify email account using verification token.

### Parameters
- `token` (URL parameter): Email verification token

### Response (Success)
```json
{
  "message": "Account verified successfully!"
}
```

---

## Forgot Password
**POST** `/auth/forgot-password`

Request password reset email.

### Request Body
```json
{
  "email": "john.doe@example.com"
}
```

### Response
```json
{
  "message": "Password reset email sent!"
}
```

---

## Reset Password
**POST** `/auth/reset-password`

Reset password using reset token.

### Request Body
```json
{
  "token": "reset_token_here",
  "password": "newSecurePassword123"
}
```

---

## Change Password
**POST** `/auth/change-password`

Change password for authenticated user.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

---

# User Management Endpoints

## Get User Info
**GET** `/user/info`

Get authenticated user's information.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Response
```json
{
  "id": "64f7b8c9e1234567890abcde",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+918408990000",
  "profilePicture": "https://bucket.s3.amazonaws.com/users/profile.jpg",
  "properties": ["64f7b8c9e1234567890abcdf"],
  "role": "user"
}
```

---

## Update User
**PUT** `/user/update`

Update user profile information.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "userId": "64f7b8c9e1234567890abcde",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+918408990000"
}
```

---

## Upload Profile Picture
**POST** `/user/uploadProfilePicture`

Upload user profile picture to S3.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)
- `profilePicture`: Image file (JPEG, PNG, JPG, WEBP, max 5MB)

### Response
```json
{
  "message": "Profile picture uploaded successfully",
  "profilePicture": "https://bucket.s3.amazonaws.com/users/profile.jpg"
}
```

---

## Add to Favourites
**POST** `/user/addToFavourites`

Add property to user's favourites.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "propertyId": "64f7b8c9e1234567890abcdf"
}
```

---

## Get Favourites
**POST** `/user/getFavourites`

Get user's favourite properties.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Response
```json
{
  "favourites": [
    {
      "id": "64f7b8c9e1234567890abcdf",
      "title": "2BHK Apartment in Gomti Nagar",
      "rent": 15000,
      "city": "Lucknow",
      "images": ["https://bucket.s3.amazonaws.com/properties/img1.jpg"]
    }
  ]
}
```

---

## Remove from Favourites
**POST** `/user/removeFromFavourites`

Remove property from favourites.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "propertyId": "64f7b8c9e1234567890abcdf"
}
```

---

## Test Token
**GET** `/user/testToken`

Validate JWT token.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Response
```json
{
  "message": "Token is valid",
  "userId": "64f7b8c9e1234567890abcde"
}
```

---

# Property Management Endpoints

## Add Property
**POST** `/property/add-property`

Create a new property listing with images and videos.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
userId: "64f7b8c9e1234567890abcde"
firstName: "John"
lastName: "Doe"
ownersContactNumber: "+918408990000"
city: "Lucknow"
locality: "Gomti Nagar"
area: "Vishesh Khand"
address: "123, Vishesh Khand, Gomti Nagar"
spaceType: "Residential"
propertyType: "Apartment"
bhk: "2"
rent: "15000"
security: "30000"
images: [file1, file2, ...]  // Max 10 images
videos: [file1, file2, ...]  // Max 5 videos
```

### Response
```json
{
  "success": true,
  "message": "Property added successfully",
  "property": {
    "id": "64f7b8c9e1234567890abcdf",
    "title": "2BHK Apartment in Gomti Nagar",
    "rent": 15000,
    "city": "Lucknow",
    "images": ["https://bucket.s3.amazonaws.com/properties/img1.jpg"],
    "slug": "2bhk-apartment-gomti-nagar-123"
  }
}
```

---

## Get Filtered Properties
**GET** `/property/filter`

Get properties with filtering options.

### Query Parameters
- `minPrice`: Minimum rent amount
- `maxPrice`: Maximum rent amount
- `bhk`: Number of bedrooms
- `locality`: Property locality
- `city`: City name
- `propertyType`: Type of property
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### Example Request
```
GET /api/v1/property/filter?minPrice=10000&maxPrice=20000&bhk=2&city=Lucknow&page=1&limit=10
```

### Response
```json
{
  "success": true,
  "properties": [
    {
      "id": "64f7b8c9e1234567890abcdf",
      "title": "2BHK Apartment in Gomti Nagar",
      "rent": 15000,
      "security": 30000,
      "city": "Lucknow",
      "locality": "Gomti Nagar",
      "bhk": "2",
      "images": ["https://bucket.s3.amazonaws.com/properties/img1.jpg"],
      "availabilityStatus": "Available"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProperties": 50
  }
}
```

---

## Get Property by ID
**GET** `/property/:id`

Get detailed information about a specific property.

### Parameters
- `id`: Property ID

### Response
```json
{
  "success": true,
  "property": {
    "id": "64f7b8c9e1234567890abcdf",
    "title": "2BHK Apartment in Gomti Nagar",
    "description": "Spacious 2BHK apartment...",
    "rent": 15000,
    "security": 30000,
    "city": "Lucknow",
    "locality": "Gomti Nagar",
    "area": "Vishesh Khand",
    "address": "123, Vishesh Khand, Gomti Nagar",
    "bhk": "2",
    "floor": "3rd Floor",
    "images": ["https://bucket.s3.amazonaws.com/properties/img1.jpg"],
    "videos": ["https://bucket.s3.amazonaws.com/properties/video1.mp4"],
    "amenities": ["Parking", "Gym", "Swimming Pool"],
    "owner": {
      "name": "John Doe",
      "contact": "+918408990000"
    },
    "availabilityStatus": "Available",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Get Property by Slug
**GET** `/property/slug/:slug`

Get property by its slug.

### Parameters
- `slug`: Property slug

---

## Update Property
**PATCH** `/property/update-property/:id`

Update existing property.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

### Parameters
- `id`: Property ID

### Request Body (Form Data)
Similar to add property, with updated fields and optional new images/videos.

---

## Update Property Availability
**PATCH** `/property/update-property-availability-status/:id`

Update property availability status.

### Parameters
- `id`: Property ID

### Request Body
```json
{
  "availabilityStatus": "Rented Out"
}
```

### Valid Status Values
- `"Available"`
- `"Rented Out"`
- `"NA"`

---

## Delete Property
**DELETE** `/property/:id`

Delete a property listing.

### Parameters
- `id`: Property ID

---

## Get Properties by User
**GET** `/property/user/:userId`

Get all properties listed by a specific user.

### Parameters
- `userId`: User ID

---

## Get Properties by Status
**GET** `/property/status`

Get properties filtered by availability status.

### Query Parameters
- `status`: Availability status (`Available`, `Rented Out`, `NA`)

---

## Purchase Query
**POST** `/property/purchasequery`

Submit a purchase inquiry for a property.

### Request Body
```json
{
  "propertyId": "64f7b8c9e1234567890abcdf",
  "userName": "Jane Smith",
  "userEmail": "jane@example.com",
  "userPhone": "+918408990001",
  "message": "I'm interested in this property"
}
```

---

# Blog Management Endpoints

## Get All Blogs
**GET** `/blog/blogs`

Get paginated list of blogs.

### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 9)
- `sortBy`: Sort order (`latest`, `trending`)

### Example Request
```
GET /api/v1/blog/blogs?page=1&limit=5&sortBy=latest
```

### Response
```json
{
  "success": true,
  "blogs": [
    {
      "id": "64f7b8c9e1234567890abce0",
      "title": "Top 10 Areas to Live in Lucknow",
      "slug": "top-10-areas-live-lucknow",
      "excerpt": "Discover the best residential areas...",
      "image": "https://bucket.s3.amazonaws.com/blogs/blog1.jpg",
      "author": "Admin",
      "date": "2024-01-15T10:30:00Z",
      "views": 1250,
      "likes": 45
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalBlogs": 25
  }
}
```

---

## Get Blog Details
**GET** `/blog/blogs/:slug`

Get detailed information about a specific blog.

### Parameters
- `slug`: Blog slug

### Response
```json
{
  "success": true,
  "blog": {
    "id": "64f7b8c9e1234567890abce0",
    "title": "Top 10 Areas to Live in Lucknow",
    "slug": "top-10-areas-live-lucknow",
    "content": "Full blog content here...",
    "image": "https://bucket.s3.amazonaws.com/blogs/blog1.jpg",
    "author": "Admin",
    "date": "2024-01-15T10:30:00Z",
    "views": 1250,
    "likes": 45,
    "tags": ["lucknow", "real-estate", "residential"]
  }
}
```

---

## Create Blog
**POST** `/blog/blogs/new`

Create a new blog post.

### Headers
```
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
title: "Blog Title"
content: "Blog content here..."
author: "Author Name"
tags: "tag1,tag2,tag3"
image: [file]  // Blog featured image
```

---

## Update Blog Views
**GET** `/blog/updateViews/:slug`

Increment blog view count.

### Parameters
- `slug`: Blog slug

---

## Update Blog Likes
**GET** `/blog/updateLikes/:id`

Toggle blog like for authenticated user.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Parameters
- `id`: Blog ID

---

# Review Management Endpoints

## Create Review
**POST** `/reviews/`

Add a review for a property.

### Request Body
```json
{
  "propertyId": "64f7b8c9e1234567890abcdf",
  "userId": "64f7b8c9e1234567890abcde",
  "rating": 4,
  "comment": "Great property with excellent amenities",
  "userName": "John Doe"
}
```

### Response
```json
{
  "success": true,
  "message": "Review added successfully",
  "review": {
    "id": "64f7b8c9e1234567890abce1",
    "rating": 4,
    "comment": "Great property with excellent amenities",
    "userName": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Get Property Reviews
**GET** `/reviews/:property`

Get all reviews for a specific property.

### Parameters
- `property`: Property ID

### Response
```json
{
  "success": true,
  "reviews": [
    {
      "id": "64f7b8c9e1234567890abce1",
      "rating": 4,
      "comment": "Great property with excellent amenities",
      "userName": "John Doe",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "averageRating": 4.2,
  "totalReviews": 15
}
```

---

## Get User Reviews for Property
**GET** `/reviews/users/:property`

Get reviews submitted by users for a property.

### Parameters
- `property`: Property ID

---

## Update Review
**PUT** `/reviews/:id`

Update an existing review.

### Parameters
- `id`: Review ID

### Request Body
```json
{
  "rating": 5,
  "comment": "Updated review comment"
}
```

---

# Contact & FAQ Endpoints

## Submit Contact Form
**POST** `/contact/submit-data`

Submit contact form data.

### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+918408990000",
  "subject": "Property Inquiry",
  "message": "I need help finding a property"
}
```

### Response
```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

---

## Get FAQs
**GET** `/faq/`

Get list of frequently asked questions.

### Response
```json
{
  "success": true,
  "faqs": [
    {
      "id": "64f7b8c9e1234567890abce2",
      "question": "How do I list my property?",
      "answer": "You can list your property by...",
      "category": "Property Listing"
    }
  ]
}
```

---

## Add FAQ
**POST** `/faq/`

Add a new FAQ (Admin only).

### Request Body
```json
{
  "question": "How do I list my property?",
  "answer": "You can list your property by...",
  "category": "Property Listing"
}
```

---

## Update FAQ
**PUT** `/faq/:id`

Update an existing FAQ.

### Parameters
- `id`: FAQ ID

---

## Delete FAQ
**DELETE** `/faq/:id`

Delete an FAQ.

### Parameters
- `id`: FAQ ID

---

## Submit Pricing Query
**POST** `/pricing/submit-pricing`

Submit pricing inquiry.

### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+918408990000",
  "propertyType": "Apartment",
  "message": "Need pricing information"
}
```

---

# File Upload (AWS S3)

The API uses AWS S3 for file storage with organized folder structure:

## Supported File Types
- **Images**: JPEG, PNG, JPG, WEBP
- **File Size Limit**: 10MB per file
- **Maximum Files**: 15 files per request

## S3 Folder Structure
```
bucket-name/
├── users/              # Profile pictures
├── properties/         # Property images and videos
├── blogs/             # Blog featured images
└── documents/         # Other documents
```

## Upload Endpoints

### Profile Picture Upload
- **Endpoint**: `POST /user/uploadProfilePicture`
- **Field Name**: `profilePicture`
- **File Limit**: 1 file, 5MB max

### Property Media Upload
- **Endpoint**: `POST /property/add-property`
- **Field Names**: 
  - `images`: Max 10 files
  - `videos`: Max 5 files

### Blog Image Upload
- **Endpoint**: `POST /blog/blogs/new`
- **Field Name**: `image`
- **File Limit**: 1 file

## Example Upload with Fetch
```javascript
const formData = new FormData();
formData.append('profilePicture', fileInput.files[0]);

fetch('/api/v1/user/uploadProfilePicture', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## Example Upload with Axios
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('videos', video1);

axios.post('/api/v1/property/add-property', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

---

# Error Handling

## Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

## Common HTTP Status Codes

### 200 - Success
Request completed successfully.

### 201 - Created
Resource created successfully.

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid request data",
  "statusCode": 400
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authorization token missing or invalid",
  "statusCode": 401
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions",
  "statusCode": 403
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "statusCode": 404
}
```

### 422 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ],
  "statusCode": 422
}
```

### 429 - Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Too many requests. Please try again later",
  "statusCode": 429
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

## File Upload Errors
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.",
  "statusCode": 400
}
```

```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB",
  "statusCode": 400
}
```

---

# Best Practices

## Authentication
- Always include the JWT token in the Authorization header for protected routes
- Token format: `Bearer <your_jwt_token>`
- Handle token expiration gracefully in your frontend
- Store tokens securely (not in localStorage for sensitive applications)

## Rate Limiting
- The API implements rate limiting on sensitive endpoints like forgot password
- Respect rate limits to avoid being temporarily blocked
- Implement exponential backoff for failed requests

## Pagination
- Use pagination for endpoints that return lists (blogs, properties, reviews)
- Default page size is usually 10-20 items
- Include page and limit parameters in your requests

## File Uploads
- Compress images before uploading to reduce file size
- Use appropriate file formats (WEBP recommended for images)
- Handle upload progress for better user experience
- Validate file types on the frontend before uploading

## Error Handling
- Always check the `success` field in responses
- Implement proper error handling for all API calls
- Display user-friendly error messages
- Log errors for debugging purposes

## Example API Usage with Fetch

### Login Example
```javascript
async function login(email, password) {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      return data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}
```

### Authenticated Request Example
```javascript
async function getUserInfo() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/v1/user/info', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      // Token expired, redirect to login
      window.location.href = '/login';
      return;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw error;
  }
}
```

## Example API Usage with Axios

### Setup Axios Interceptors
```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api/v1'
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Examples
```javascript
// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data.user;
};

// Get filtered properties
const getProperties = async (filters) => {
  const response = await api.get('/property/filter', { params: filters });
  return response.data;
};

// Upload profile picture
const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await api.post('/user/uploadProfilePicture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};
```

---

## Environment Variables Required

Make sure these environment variables are set in your `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/tolet

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Other
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your_session_secret
NODE_ENV=development
PORT=8000
```

---

This documentation covers all the major endpoints and functionality of your To-Let Backend API. For additional support or questions, please refer to the source code or contact the development team.
