# PostNode Server

[![GitHub issues](https://img.shields.io/github/issues/guptapriyanshu7/rest-api?style=for-the-badge)](https://github.com/guptapriyanshu7/rest-api/issues)
[![GitHub stars](https://img.shields.io/github/stars/guptapriyanshu7/rest-api?style=for-the-badge)](https://github.com/guptapriyanshu7/rest-api/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/guptapriyanshu7/rest-api?style=for-the-badge)](https://github.com/guptapriyanshu7/rest-api/network)
[![GitHub license](https://img.shields.io/github/license/guptapriyanshu7/rest-api?style=for-the-badge)](https://github.com/guptapriyanshu7/rest-api/blob/main/LICENSE)

> A feature rich REST API for blog-like applications using Node.js.

Handles image-upload, uses web-sockets for live feed, authentication using JWT and e-mail verification using SendGrid.

## Local Setup

- Clone this repo: `git clone https://github.com/guptapriyanshu7/rest-api`
- Run `npm install`
- Setup environment variables :
  - Create a `.env` file in root directory of the project
  - Insert these 3 keys/value pairs :
    - **PORT** : _< Port on which server will listen >_
    - **MONGO_URI** : _< Mongo database connection URI >_
    - **SENDGRID_API_KEY** : _< Api key for sendgrid. >_
- Start the server: `npm start`
- Start requesting the server.

## Explore Rest APIs

The app defines following CRUD APIs.

### Auth

| Method | Url | Description |
| ------ | --- | ----------- |
| POST    | /api/login | Login via e-mail and password. |
| POST   | /api/signup | Signup requires email and password. |
| GET    | /api/status |  Returns the status of user. |
| PATCH    | /api/status |  Updates the status of user. |
| POST    | /api/verify/{token} |  Matches the token and sets the user as verified. |
| POST | /api/change-password | To change the password of user. |
| POST | /api/reset | Send reset token to validate user. |
| GET | /api/reset/{token} | Match token to complete verification. |

### Posts

| Method | Url | Description |
| ------ | --- | ----------- |
| GET    | /api/posts | Returns all the posts. |
| POST   | /api/post | Creates a post using title and content. |
| GET    | /api/post/{id} | Get the post by id. |
| PUT    | /api/post/{id} | Update post. |
| DELETE | /api/post/{id} | Delete post from database. |

## Folder Structure
```
rest-api
├── controllers (Functions to run when an API endpoint is hit.)
│   ├── auth.js
│   └── feed.js
├── images (Uploaded images are stored here.)
├── index.js
├── middlewares (Auth middleware.)
│   └── isAuth.js
├── models (MongoDB models.)
│   ├── post.js
│   └── user.js
├── package.json
├── package-lock.json
├── routes (API endpoints.)
│   ├── auth.js
│   └── feed.js
├── test (Tests to the application.)
│   ├── auth-controller.js
│   ├── auth-middleware.js
│   ├── feed-controller.js
│   └── start.js
└── utils (Utilities folder.)
    └── socket.js
 ```

**GraphQL alternative** - https://github.com/guptapriyanshu7/graphql

## License
This project is licensed under the MIT License, © 2021 Priyanshu Gupta. See [LICENSE](https://github.com/guptapriyanshu7/rest-api/blob/main/LICENSE) for more details.
