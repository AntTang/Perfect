var crypto=require('crypto');
var $=require('underscore');
//密码加密解密
var DEFAULTS = {
  encoding: {
    input: 'utf8',
    output: 'hex'
  },
  algorithms: ['bf', 'blowfish', 'aes-128-cbc']
};
function MixCrypto(options) {
  if (typeof options == 'string')
    options = { key: options };

  options = $.extend({}, DEFAULTS, options);
  this.key = options.key;
  this.inputEncoding = options.encoding.input;
  this.outputEncoding = options.encoding.output;
  this.algorithms = options.algorithms;
}

MixCrypto.prototype.encrypt = function (plaintext) {
  return $.reduce(this.algorithms, function (memo, a) {
    var cipher = crypto.createCipher(a, this.key);
    return cipher.update(memo, this.inputEncoding, this.outputEncoding)
      + cipher.final(this.outputEncoding)
  }, plaintext, this);
};
MixCrypto.prototype.decrypt = function (crypted) {
  try {
    return $.reduceRight(this.algorithms, function (memo, a) {
      var decipher = crypto.createDecipher(a, this.key);
      return decipher.update(memo, this.outputEncoding, this.inputEncoding)
        + decipher.final(this.inputEncoding);
    }, crypted, this);
  } catch (e) {
    return;
  }
};

exports.users = {
  login: function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    req.getConnection(function (err, conn) {
      if (err) {
        return next(err);
      } else {
        var mixCrypto = new MixCrypto('string');
        conn.query('select * from user where username = "' + username + '"', [], function (err, result) {
          if (err) {
          } else {
            for(var i = 0;i<result.length;i++){
              if(mixCrypto.decrypt(result[i].password) === password){
                req.session.user = username;
                res.render('index', {'user': username});
                return;
              }
            }
            res.send({'status': 1, 'msg': '用户名或密码错误'});
          }
        });
      }
    });
  },
  renderLogin: function (req, res) {
    res.render('login');
  },
  logout: function (req, res) {
    req.session.user = null;
    res.redirect('/login');
  }
};