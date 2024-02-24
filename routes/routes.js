const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path'); 
const fs = require('fs');

const User = require('../models/User')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const Book = require('../models/Book')
const Podcasts = require('../models/Podcast')

function loadTranslation(language) {
    const translation = fs.readFileSync(`languages/${language}.json`);
    return JSON.parse(translation);
  }
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    res.status(200).render('register');
});

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login'); 
    }
  
    jwt.verify(token, 'secret_key', (err, user) => {
      if (err) {
        return res.redirect('/login');
      }
      req.user = user;
      next();
    });
  };

  const lang = (req, res, next) => {
    console.log( req.query.lang )
    const language =  req.query.lang  || 'en';
    const translation = loadTranslation(language);
    req.session.language = language; 
    res.locals.translation = translation;
    res.locals.currentLanguage = language;
    next();
  }

const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(403).send('Forbidden'); 
    }
    next();
};

router.post('/change-language', (req, res) => {
    const language = req.body.language;
    req.session.language = language; 
    var currentUrl = req.headers.referer || '/';
    const langQueryParamIndex = currentUrl.indexOf('?lang=');
    if (langQueryParamIndex !== -1) {
        currentUrl = currentUrl.substring(0, langQueryParamIndex) + `?lang=${language}`;
    } else {
        const separator = currentUrl.includes('?') ? '&' : '?';
        currentUrl = `${currentUrl}${separator}lang=${language}`;
    }
    console.log(langQueryParamIndex, currentUrl)
    res.redirect(currentUrl);
});


router.get('/index', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        const courses = await Course.find();
        const currentLanguage = req.session.language || 'en';
        res.render('index', { userId: user.userId, isAdmin: req.user.role, courses, translation: res.locals.translation, currentLanguage });
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/myCourses', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const enrollments = await Enrollment.find({ user: userId }).populate('course');
        const courses = enrollments.map(enrollment => enrollment.course);
        const currentLanguage = req.session.language || 'en'; 
        res.status(200).render('myCourses', { userId, isAdmin: req.user.role, courses, translation: res.locals.translation, currentLanguage});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const user = await User.findById(userId)
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('profile', { userId: userId, isAdmin: user.isAdmin, user: user, translation: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Err0or');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).send({message: 'Invalid username'})
            return; 
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(500).send({ message: 'Invalid password' });
            return; 
        }
        const token = jwt.sign({ 
            userId: user._id, 
            username: user.username, 
            role: user.isAdmin, 
        }, 'secret_key');
        res.cookie('token', token);
        req.session.user = user;
        const courses = await Course.find();
        res.status(200).redirect('/index'); 
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('An error occurred while logging in');
    }
})


router.get('/login', (req, res) => {
    res.status(200).render('login');
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ username, email});
        if (existingUser) {
            res.status(500).render("register.ejs", { errorMessage: "Username already exists" });
            return; 
        }
        let isAdmin = false;
        if (password === "zhansaya" && email === "zhansaya@gmail.com" && username === "zhansaya") {
            isAdmin = true;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email,password:hashedPassword, isAdmin });
        await newUser.save();

        req.session.userId = newUser._id;
        res.redirect(`/login`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/courses/:courseId', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).send('Course not found');
        }
        const currentLanguage = req.session.language || 'en';

+        res.status(200).render('course', {userId: null, isAdmin:false, course, translation: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/admin/users', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('admin', { userId: req.user._id, isAdmin: req.user.isAdmin, users: users, translation: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});


router.get('/logout', (req, res)=>{
    res.render('login')
})

router.post('/admin/add', authenticateUser, authorizeAdmin,lang, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, isAdmin: false });
        await newUser.save();
        const users = await User.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('admin', { userId: req.user._id, isAdmin: req.user.isAdmin, users: users, translation: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/admin/update/:userId', authenticateUser, authorizeAdmin, lang, async(req, res) => {
    const userId = req.params.userId;
    const { username, email, password } = req.body; 
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (username) {
            user.username = username;
        }
        if (email) {
            user.email = email;
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        await user.save();
        const users = await User.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('admin', { userId: req.user._id, isAdmin: req.user.isAdmin, users: users, translation: res.locals.translation, currentLanguage });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/admin/delete/:userId', authenticateUser, authorizeAdmin,lang,  async (req, res) => {
    try {
        const userId = req.params.userId;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).send('User not found');
        }
        const users = await User.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('admin', { userId: req.user._id, isAdmin: req.user.isAdmin, users: users, translation: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/updateUser', authenticateUser, async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (username) {
            user.username = username;
        }
        if (email) {
            user.email = email;
        }
        await user.save();

        res.status(200).send('User information updated successfully');
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/admin/courses', authenticateUser, authorizeAdmin, async (req, res)=>{
    try {
        const courses = await Course.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('newCourse',{ userId: req.user._id, isAdmin: req.user.isAdmin, courses: courses, translation: res.locals.translation, currentLanguage});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/admin/courses', authenticateUser, authorizeAdmin, upload.array('images[]'), async (req, res) => {
    try {
        const imageUrls = req.files.map(file => {
            const correctedPath = file.path.replace(/\\/g, '/');
            return correctedPath;
        });

        const newCourse = new Course({
            names: req.body.names,
            descriptions: req.body.descriptions,
            images: imageUrls, 
            duration: req.body.duration,
            price: req.body.price,
            places: req.body.places,
            category: req.body.category,
            startDate: req.body.startDate,
            endDate: req.body.endDate
        });
        const savedCourse = await newCourse.save();

        const courses = await Course.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('newCourse',{ userId: req.user._id, isAdmin: req.user.isAdmin, courses: courses, translation: res.locals.translation, currentLanguage});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/admin/courses/update/:courseId', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { names, descriptions, duration, price, places, category, startDate, endDate } = req.body;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).send('Course not found');
        }
        if (names) {
            course.names = names.map(name => ({ language: name.language, name: name.name }));
        }
        if (descriptions) {
            course.descriptions = descriptions.map(description => ({ language: description.language, description: description.description }));
        }
        if (duration) {
            course.duration = duration;
        }
        if (price) {
            course.price = price;
        }
        if (places) {
            course.places = places;
        }
        if (category) {
            course.category = category;
        }
        if (startDate) {
            course.startDate = startDate;
        }
        if (endDate) {
            course.endDate = endDate;
        }
        const updatedCourse = await course.save();

        const courses = await Course.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('newCourse',{ userId: req.user._id, isAdmin: req.user.isAdmin, courses: courses, translation: res.locals.translation, currentLanguage});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/admin/courses/delete/:coursesId', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const courseId = req.params.coursesId;
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        if (!deletedCourse) {
            return res.status(404).send('Course not found');
        }
        const courses = await Course.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('newCourse',{ userId: req.user._id, isAdmin: req.user.isAdmin, courses: courses, translation: res.locals.translation, currentLanguage});
     } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/courses/:courseId/enroll', authenticateUser, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user.userId;
        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).send('You are already enrolled in this course.');
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).send('Course not found.');
        }
        if (course.places !== undefined && course.places <= 0) {
            return res.status(400).send('No available places in this course.');
        }
        if (course.places !== undefined) {
            course.places -= 1;
            await course.save();
        }
        const enrollment = new Enrollment({
            user: userId,
            course: courseId
        });
        await enrollment.save()
        const currentLanguage = req.session.language || 'en';


        const currentUser = await User.findById(userId); 

        res.status(201).render('profile', {userId: userId, isAdmin: req.user.userId, user: currentUser, translation: res.locals.translation, currentLanguage});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




router.get('/books', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentLanguage = req.session.language || 'en';

        res.render('books', { userId: userId, isAdmin: req.user.role, books: null, translation: res.locals.translation, currentLanguage }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error rendering nutrition page");
    }
});


router.post('/books',authenticateUser, lang,   async (req, res) => {
    const userId = req.user.userId;
    const bookTitle = req.body.book;

    try {
        const apiUrl = `https://openlibrary.org/search.json?q=${bookTitle}&limit=5`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.docs.length === 0) {
            res.render('books', { userId: userId, books: [] , translation: res.locals.translation, currentLanguage}); 
        } else {
            const booksData = data.docs.map(book => ({
                title: book.title,
                author: book.author_name ? book.author_name[0] : 'Unknown',
                publishDate: book.publish_date ? book.publish_date[0] : 'Unknown'
            }));
            const newBook = new Book({
                user: userId,
                books: booksData
            });
            await newBook.save();
            const currentLanguage = req.session.language || 'en';

            console.log(res.locals.translation, req.session.language )
            res.render('books', { userId: userId, isAdmin: req.user.role, books: booksData , translation: res.locals.translation, currentLanguage});
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send("Error rendering books page");
    }
});


router.get('/podcasts',authenticateUser, async (req, res)=>{
    try {
        const userId = req.user.userId;
        const currentLanguage = req.session.language || 'en';

        res.render('podcast', { userId: userId, isAdmin: req.user.role, podcasts: null, translation: res.locals.translation, currentLanguage }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error rendering nutrition page");
    }
})


router.post('/podcasts', authenticateUser, lang, async (req, res) => {
    try {
        const search = req.body.search;

        const response = await axios.get('https://itunes.apple.com/search', {
            params: {
                term: search,
                media: 'podcast',
                limit: 4
            }
        });
        const podcasts = response.data.results;
        const savedPodcasts = await Podcasts.create({
            user: req.user.userId,
            podcasts: podcasts.map(podcast => ({
                trackName: podcast.trackName,
                artistName: podcast.artistName,
                primaryGenreName: podcast.primaryGenreName,
                artworkUrl600: podcast.artworkUrl600,
                releaseDate: podcast.releaseDate,
                collectionViewUrl: podcast.collectionViewUrl
            }))
        });
        const currentLanguage = req.session.language || 'en';

        res.render('podcast', { userId: req.user.userId, isAdmin: req.user.role, search, podcasts, translation: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error('Error searching podcasts:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;