# Course Management Hub

The Course Management Hub API offers a comprehensive suite of endpoints tailored for managing educational courses efficiently. Primarily focused on courses, this API also provides functionalities for handling podcasts and books related to the educational domain. With a user-friendly interface and robust features, it simplifies the management of course materials, enrollment, and user profiles.


## Installation

1. Clone the repository to your local machine:
    
    ```bash
        git clone https://github.com/Poullsonn/Assik4-Final.git


2. Install dependencies:

    ```bash
    npm install


3. Start the application:

    ```bash
    nodemon app.js


The application will be available at http://localhost:3000/.


## Technologies

- Node.js
- Express.js
- MongoDB
- EJS (Embedded JavaScript)
- Multer (for image upload)
- Axios (for HTTP requests)
- bcryptjs (for password hashing)
- express-session (for session management)

## Admin Info
- username: zhansaya
- email: zhansaya@gmail.com
- password: zhansaya

## Endpoints

- GET /: Renders the registration page.
- POST /change-language: Updates the session language based on user selection.
- GET /index: Renders the main index page with course information.
- GET /myCourses: Renders the page displaying courses enrolled by the user.
- GET /profile: Renders the user profile page.
- POST /login: Logs in a user with provided credentials.
- GET /login: Renders the login page.
- POST /register: Registers a new user.
- GET /courses/:courseId: Renders the page displaying details of a specific course.
- GET /admin/users: Renders the admin page displaying user information.
- GET /logout: Renders the login page after logging out.
- POST /admin/add: Adds a new user by an admin.
- POST /admin/update/:userId: Updates user information by an admin.
- POST /admin/delete/:userId: Deletes a user by an admin.
- POST /updateUser: Updates the user's own information.
- GET /admin/courses: Renders the admin page displaying course information.
- POST /admin/courses: Adds a new course by an admin.
- POST /admin/courses/update/:courseId: Updates course information by an admin.
- POST /admin/courses/delete/:coursesId: Deletes a course by an admin.
- POST /courses/:courseId/enroll: Enrolls a user in a course.
- GET /books: Renders the page to search for books.
- POST /books: Searches for books based on user input.
- GET /podcasts: Renders the page to search for podcasts.
- POST /podcasts: Searches for podcasts based on user input.

## Project Structure

The project structure is organized as follows:

- **routes/**: Contains route definitions and middleware for handling HTTP requests.
- **uploads/**: Directory for storing uploaded files, such as images or documents.
- **models/**: Contains Mongoose models for defining data schemas.
- **languages/**: Stores JSON files for different languages used in localization.
- **views/**: Contains EJS templates for rendering HTML pages.
- **app.js**: Main entry point of the application.
- **package.json**: File containing project metadata and dependencies.
- **README.md**: Documentation file providing an overview of the project.

```
course-management-system/
│
├── routes/
│ └── routes.js
│
├── uploads/
│
├── models/
│ ├── User.js
│ ├── Course.js
│ ├── Enrollment.js
│ ├── Podcast.js
│ └── Book.js
│
├── languages/
│ ├── en.json
│ └── kz.json
│
├── views/
│ ├── admin.ejs
│ ├── course.ejs
│ ├── books.ejs
│ ├── podcast.ejs
│ ├── newCourses.ejs
│ ├── myCourses.ejs
│ ├── index.ejs
│ ├── login.ejs
│ ├── profile.ejs
│ └── register.ejs
├── app.js
├── package.json
└── README.md
```