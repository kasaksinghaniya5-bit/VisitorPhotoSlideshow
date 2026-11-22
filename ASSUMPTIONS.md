# Project Assumptions

During the development of the Visitor Photo Slideshow application, some implementation decisions were made where the requirements did not specify every technical or functional detail.

The following assumptions were used to complete the application.

## 1. User Roles

**Assumption:** The application has two main user roles: Visitors and Administrators.

**Reason:** Visitors need to register and upload photographs, while administrators need separate access to manage submissions and public content.

## 2. Separate Admin Login

**Assumption:** Administrators access their login panel through a dedicated `/admin` URL.

**Reason:** This keeps administrator access separate from the regular visitor login experience.

## 3. Admin Approval of Photographs

**Assumption:** Uploaded photographs should be reviewed and approved by an administrator before appearing in the public gallery and shared slideshow.

**Reason:** This provides control over which photographs become publicly visible.

## 4. Public Community Gallery

**Assumption:** Approved public photographs can be viewed by visitors without requiring an administrator account.

**Reason:** The Community Photo Gallery is intended to allow users to explore shared photographs.

## 5. Shared Slideshow

**Assumption:** The slideshow displays approved shared photographs and automatically changes photographs after a fixed interval.

**Reason:** Automatic transitions provide a continuous photo-display experience without requiring manual navigation.

## 6. Image Storage

**Assumption:** Cloudinary is used for image storage, with Multer handling incoming file uploads on the backend.

**Reason:** This separates image storage from the main application database and supports image-upload functionality.

## 7. Database

**Assumption:** MongoDB is used to store application information, including visitor and photo records.

**Reason:** MongoDB works with the application's Node.js and Express backend through Mongoose.

## 8. Authentication

**Assumption:** JWT is used for authentication, and bcryptjs is used for password hashing.

**Reason:** These technologies provide a way to manage authenticated sessions and protect stored passwords.

## 9. Local Development

**Assumption:** The application is developed and tested locally before deployment.

**Reason:** Local development makes it possible to build and verify frontend and backend functionality independently.

## 10. Deployment

**Assumption:** Deployment is not included in the current completed development stage.

**Reason:** The application is currently configured for local execution. A deployed version can be added later.

## Conclusion

These assumptions helped establish consistent application behaviour and guided implementation decisions where detailed requirements were not available.