import path from 'path';

import 'dotenv/config.js';
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import feedRoutes from './routes/feed.js';
import authRoutes from './routes/auth.js';
import socket from './utils/socket.js';

try {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  console.log('Database connection successful !!!');
} catch (error) {
  console.log(error);
}

const app = express();
const router = express.Router();
const __dirname = path.resolve();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

app.use('/feed', feedRoutes(router));
app.use('/auth', authRoutes(router));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running at port: ${process.env.PORT}`);
});

const io = socket.init(server);
io.on('connection', (socket) => {
  console.log('Client connected');
});
