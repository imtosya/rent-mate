module.exports = function auth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: 'Необходима авторизация. Войди в аккаунт.',
            code: 'UNAUTHORIZED'
        });
    }
    next();
};


module.exports.optional = function authOptional(req, res, next) {
    next();
};