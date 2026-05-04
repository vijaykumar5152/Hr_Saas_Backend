const jwt = require('jsonwebtoken')

const generateToken = (data, type = 'user') => {
    // For company tokens
    if (type === 'company') {
        return jwt.sign({
            id: data.id,
            company_name: data.company_name,
            email: data.email,
            subscription_plan: data.subscription_plan,
            type: 'company'
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
    }
    
    // For user tokens
    return jwt.sign({
        id: data.id,
        company_id: data.company_id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        type: 'user'
    }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

module.exports = generateToken