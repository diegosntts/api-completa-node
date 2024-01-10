const bcrypt = require('bcrypt');
const Users = require('../models/Users');

class UserController {
  async create(req, res) {
    try {
      const { email, password } = req.body;

      // Verifica se o usuário já existe
      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists!' });
      }

      // Criptografa a senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Cria o usuário no banco de dados
      const newUser = await Users.create({
        ...req.body,
        password_hash: hashedPassword,
      });

      res.status(201).json({ user: newUser, message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating user' });
    }
  }

  async update(req, res) {
    try {
      const {
        name, avatar, bio, gender, old_password, new_password, confirm_new_password,
      } = req.body;
      const { userId } = req;

      // Verifica se o ID do usuário está definido
      if (!userId) {
        return res.status(400).json({ error: 'User ID is undefined' });
      }

      // Busca o usuário no banco de dados
      const user = await Users.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let encryptedPassword = '';

      // Se senha antiga for fornecida, verifica e atualiza a senha
      if (old_password) {
        if (!(await user.checkPassword(old_password))) {
          return res.status(401).json({ error: 'Old password does not match' });
        }

        // Verifica se as novas senhas coincidem
        if (new_password !== confirm_new_password) {
          return res.status(400).json({
            error: 'New password and confirm new password do not match',
          });
        }

        // Criptografa a nova senha
        encryptedPassword = await bcrypt.hash(new_password, 8);
      }

      // Atualiza as informações do usuário no banco de dados
      await user.update({
        name: name || user.name,
        avatar: avatar || user.avatar,
        bio: bio || user.bio,
        gender: gender || user.gender,
        password_hash: encryptedPassword || user.password_hash,
      });

      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating user' });
    }
  }

  async delete(req, res) {
    const userToDelete = await Users.findOne({
      where: {
        id: req.userId,
      },
    });
    if (!userToDelete) {
      return res.status(400).json({ message: 'User not exists!' });
    }
    await Users.destroy({
      where: {
        id: req.userId,
      },
    });
    return res.status(200).json({ message: 'User deleted' });
  }

  async userProfile(req, res) {
    const user = await Users.findOne({
      attributes: ['id', 'name', 'user_name', 'email', 'avatar', 'bio', 'gender'],
      where: {
        id: req.userId,
      },
    });
    if (!user) {
      return res.status(400).json({ message: 'User not exists!' });
    }
    const {
      id, name, user_name, email, avatar, bio, gender,
    } = user;
    return res.status(200).json({
      id, name, user_name, email, avatar, bio, gender,
    });
  }
}

module.exports = new UserController();
