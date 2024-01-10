const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const bcryptjs = require('bcrypt');

class Users extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        user_name: Sequelize.STRING,
        email: Sequelize.STRING,
        avatar: Sequelize.STRING,
        bio: Sequelize.STRING,
        gender: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      },
    );

    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await bcryptjs.hash(user.password, 8);
      }
    });
    return this;
  }

  checkPassword(passowrd) {
    return bcryptjs.compare(passowrd, this.password_hash);
  }
}

module.exports = Users;