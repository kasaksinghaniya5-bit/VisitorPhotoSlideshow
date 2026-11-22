# Visitor Photo Slideshow

## About the Project

Visitor Photo Slideshow is a web-based application designed to collect, manage, and display visitor photographs.

Visitors can register, upload photographs, and explore publicly shared photos. Administrators can manage visitor submissions and approve photographs for public display. The application also provides a shared slideshow that automatically displays approved public photographs.

## Features

- Visitor registration and login
- Secure visitor authentication
- Photo uploading
- Community Photo Gallery
- Shared Slideshow with automatic photo transitions
- Admin login and dashboard
- Admin photo management and approval
- Cloudinary integration for image storage

## Technology Stack

### Frontend
- React 19
- Vite
- Axios
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Multer
- Cloudinary
- dotenv

## Project Structure

```text
VisitorPhotoSlideshow/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── README.md
├── AI_LOG.md
├── ASSUMPTIONS.md
└── ARCHITECTURE.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB
- A Cloudinary account

## Environment Configuration

Create a `.env` file inside the `backend` folder.

Use `backend/.env.example` as a reference and configure your own environment variables.

Never share or commit actual credentials.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd VisitorPhotoSlideshow
```

### 2. Start the Backend

```bash
cd backend
npm install
```

Configure the backend `.env` file, then start the server:

```bash
node server.js
```

The backend runs on:

`http://localhost:5000`

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## API Routes

| Route | Purpose |
|---|---|
| `/api/visitors` | Visitor-related operations |
| `/api/photos` | Photo-related operations |
| `/api/admin` | Admin-related operations |

## Testing

Testing is documented in the repository's test plan. Refer to the testing documentation for test cases and results.

## Deployment

The application is currently running locally and has not yet been deployed.

## AI Usage

AI assistance was used during development for code explanations, debugging, implementation guidance, and documentation.

Refer to `AI_LOG.md` for details about AI interactions and corrections.

## License

This project was developed for academic purposes.
