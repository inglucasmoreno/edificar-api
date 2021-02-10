// Success
const success = (res, msg) => {
    if(typeof(msg) == 'object'){
        res.status(200).json(msg);    
    }else{
        res.status(200).json({ msg })
    }
}

// Error
const error = (res, status, msg = "Error de servidor") => {
    if(status == 500){
        msg = "Error de servidor";
    }
    if(typeof(msg) == 'object'){
        return res.status(status).json(msg);
    }
    res.status(status).json({ msg })
}

module.exports = {
    success,
    error
}