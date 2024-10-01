# pinterest-clone


This project is a Pinterest-like website built using Node.js and Express.js, with MongoDB as the database. It allows users to sign up, log in, create boards, save images, and share them with other users.

Features
User Authentication: Users can securely sign up, log in, and log out using Passport.js with the local strategy.
Board Creation: Users can create boards to organize and save their images.
Image Management: Users can save and view images, as well as edit and delete their own posts.
Responsive Design: The website is designed to be responsive across different devices.
Technologies Used
Node.js
Express.js
MongoDB
Passport.js
Multer
EJS (Embedded JavaScript)
Installation
Clone the repository:

git clone https://github.com/rk-rohit-27/pinterest-clone


Install dependencies:
bash
Copy code
cd pinterest-full-stack

Set up MongoDB:

Ensure MongoDB is installed and running on your local machine.
Start the server:


npm start
Open your web browser and navigate to http://localhost:3000 to access the website.

Folder Structure
views/: Contains EJS templates for rendering HTML pages.
public/: Contains static assets such as CSS files, images, and client-side JavaScript.
routes/: Contains route handlers for different parts of the application.
models/: Contains Mongoose models for interacting with the MongoDB database.
config/: Contains configuration files, including Passport.js configuration.
middleware/: Contains custom middleware functions.
uploads/: Directory for storing uploaded images.
Usage
Sign up for a new account or log in with existing credentials.
Create boards to organize your images.
Upload images to your boards and view them in your profile.
Explore images shared by other users in the feed.
Contributing
Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

License
This project is licensed under the MIT License.
