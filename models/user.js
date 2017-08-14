"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // User.hasMany(models.Task);
        // TODO: it seems like there should be a cleaner way to acheive this.
        // assigned the first instance of User.HasMany above to User.Tasks trows and error.
        // User.Tasks = User.hasMany(models.Task, {as: 'tasks'});
        models.User.belongsToMany(models.Task, { as: 'Tasks', through: 'worker_tasks', foreignKey: 'userId' })
      }
    }
  });

  return User;
};
