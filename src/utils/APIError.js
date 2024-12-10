class APIError extends  Error{     //Error is a class of nodejs
    constructor(
        statusCode, 
        message= "something went wrong" , 
        errors= [],
        stack = "" 
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.messege = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack=stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {APIError}