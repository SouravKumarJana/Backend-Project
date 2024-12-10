const asyncHandler = (requestHandler) =>{
    return (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }
}


/*  we can do also un this way:  

const asyncHandler = (fun) => async (req ,res, next) =>{      // it is a higher order function (Means Here function accept an another function as argument)
    try {
        await fun(req, res , next)
    } catch (error) {
        res.status(err.code || 500).json({     //send the error code ,if user pass the code , other wise throw erro-code 500  .. also send a json type messege : success and messege
            success : false,
            message: err.message
        })
    }
}
*/    

export {asyncHandler}