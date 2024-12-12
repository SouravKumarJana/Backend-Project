# Backend devlopement with js

-[Model link by erase] (https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

-[gitignore file website  link] (https://mrkandreev.name/snippets/gitignore-generator/)

Here use "nodemon" utility : it automaticaly start the server aach time after loading the file
     npm i -D nodemon    //it is only used in at devlopment purpuse , not deployed at server

Here we use "prettier" : Prettier’s ability to provide consistency in code formatting across a team or project is one of its key advantages. 
                         Indentation, space, and punctuation are a few examples of the formatting preferences that many developers could have, 
                         as we saw in the beginning. The codebase may become inconsistent as a result, making it more challenging for team 
                         members to read and comprehend one another’s code.

Prettier addresses this issue by automatically formatting your code in accordance with a predetermined set of guidelines. 
Prettier’s configuration file allows you to modify these guidelines and establish team-wide formatting guidelines. 
You can tell Prettier, for instance, that a sentence should always conclude with a semicolon or that it should always use two spaces for indentation.

.prettierignore : Here write those  file_name  where we dont want to apply the the prettier 

# Folders of src :
db : Here we write the databse logic
controllers : Here we write majorly the functionality
middlewares : if we want to do anything 
models: Here we do data modeling
routes: Here do routes
utils : here we write utility (the functionality which are using multiple time )


#
if there are are any empty folder is needed for the work flow , we create a empty folder .
but empty folder are not tracked by git so we create a empty file named ".gitkeep" under this empty folder

#
***** DataBase is always in another continent*****
so, when we do any operation with database , its take some time -> for this we use async - await

#
when we use middle-ware , we generally use app.use()

#
Cookies are small data that are stored on a client side and sent to the client along with server requests. Cookies have various functionality, they can be used for maintaining sessions and adding user-specific features in your web app. For this, we will use cookie-parser module of npm which provides middleware for parsing of cookies.

for use cookies install middleware : npm i cookie-parser

#
The word CORS stands for “Cross-Origin Resource Sharing”. Cross-Origin Resource Sharing is an HTTP-header based mechanism implemented by the browser which allows a server or an API(Application Programming Interface) to indicate any origins (different in terms of protocol, hostname, or port) other than its origin from which the unknown origin gets permission to access and load resources. The cors package available in the npm registry is used to tackle CORS errors in a Node.js application. 

=> Why Use CORS?
The reasons to use CORS in the application are

Security: CORS helps to prevent malicious websites from accessing sensitive information on your server.

Resource Sharing: It allows controlled access to resources on a server from a different origin, enabling web applications to make API requests to external services.

for install install : npm i cors
#
bcrypt : bcrypt is use hash the password that provide the password..
[brypt documents for reading]  (https://www.geeksforgeeks.org/npm-bcrypt/)


#step of upload file :
step1: using multer we take  files from user ans tempuraly store at local server 
step2 : then upload file at cloudinary, and we save the cloudinary url (of this file) at the database

#fs:
fs is a library if nodejs that help to handle the file
[document link of fs] (https://nodejs.org/api/fs.html#fspromisesunlinkpath)

#

Access tokens are used to access resources, while refresh tokens are used to get new access tokens when the old ones expire. Both access and refresh tokens often use a format called JSON Web Token(JWT). 

[token reading link] (https://www.geeksforgeeks.org/access-token-vs-refresh-token-a-breakdown/)
