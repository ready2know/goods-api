const expect = require("chai").expect;

const authMiddleware = require("../middlewares/is-auth");

describe("auth-middleware", function () {

    it("Проброс ошибки, если нет Authentication Header", function(){
        const req = {
            get: function(){
                return null;
            }
        }
        expect(authMiddleware.bind(this, req, {}, (error)=> {throw error})).to.throw('Not authenticated.');
    });

    it("Проброс ошибки, если Authentication Header в одну строку", function(){
        const req = {
            get: function(){
                return "notvalidtoken";
            }
        }
        expect(authMiddleware.bind(this, req, {}, (error)=> {throw error})).to.throw('Not valid token.');
    });

    it("Проброс ошибки, если Authentication Header не валидный", function(){
        const req = {
            get: function(){
                return "Bearer abc";
            }
        }
        expect(authMiddleware.bind(this, req, {}, (error)=> {throw error})).to.throw('Not valid token.');
    });
});