# RepoLink

RepoLink is a web application that allows users to manage their repositories, issues, and projects. It provides features such as repository creation, issue tracking, project uploads, and user authentication.


## Features

- User authentication (signup, login, logout)
- Repository management (create, delete, star, toggle visibility)
- Issue tracking (create, delete, view issues)
- Project uploads (upload, view, download, delete projects)
- Heatmap visualization of user contributions

## Tech Stack

- **Frontend**: React, Vite, Axios, React Router, FontAwesome
- **Backend**: Node.js, Express, MongoDB, Mongoose, AWS S3, Multer, JWT
- **Database**: MongoDB

## Installation

### Backend

1. Navigate to the `backend` directory:

    ```sh
    cd backend
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

### Frontend

1. Navigate to the `frontend` directory:

    ```sh
    cd frontend
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

## Backend

### Environment Variables

Create a `.env` file in the `backend` directory and add the following environment variables:

```sh
MONGODB_URL=<your_mongodb_url> JWT_SECRET_KEY=<your_jwt_secret_key> AWS_ACCESS_KEY_ID=<your_aws_access_key_id> AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key> S3_BUCKET=<your_s3_bucket_name> PORT=<your_port_number>
```

### Running the Backend

To start the backend server, run the following command in the `backend` directory:

```sh
node index.js start
```

## Frontend

***Running the Frontend**
To start the frontend development server, run the following command in the frontend directory:

```sh
npm run dev
```

### Usage

1. Sign up for a new account or log in with your existing credentials.

2. Create, delete, and manage repositories, issues, and projects.

3. View and manage your profile, including starred repositories and contribution heatmap.

## License

This project is licensed under the MIT License.