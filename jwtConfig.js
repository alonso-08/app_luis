const jwt = require('jsonwebtoken');
const secretKey = 'asjdhaksdhkasjd43987';
function generateToken(email) {
    //test expiresIn: '5000ms'
    return jwt.sign({ email: email }, secretKey, { expiresIn: '6h' });
}


const authenticationsJWT = (request,response, next) => {
    const authHeader = request.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            var decoded = jwt.verify(token, secretKey);
            next()
        } catch (error) {
            response.sendStatus(401);
            return
        }
    }else{        
        response.sendStatus(401)
    }
}

module.exports = { generateToken, authenticationsJWT }