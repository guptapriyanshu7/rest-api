# rest-api

An API for blog-like applications. Endpoints are -

Auth
 - /login :-
  Login via e-mail and password.
 - /signup :-
  Signup requires email and password
 - /status :-
  Returns the status of users.
 - /verify :-
  To generate verification mail.
 - /verify/:token :-
  Matches the token and sets the user as verified.
 - /change-password :-
  To change the password of user.
  
  
Feed
 - /posts :-
  Returns all the posts.
 - /post :- 
  Creates a post using title and content.
 - /post/:postId :- 
 
    GET - Returns the post by postId.
    
    PUT - Updates the post.
    
    DELETE - Deletes the post from the database.
    
Frontend - https://github.com/guptapriyanshu7/PostNode
  
  
