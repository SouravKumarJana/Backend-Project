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

