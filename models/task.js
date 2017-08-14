"use strict";

module.exports = function(sequelize, DataTypes) {
  var Task = sequelize.define("Task", {
    title: DataTypes.STRING,
    users: DataTypes.ARRAY(DataTypes.JSONB)
  }, {
    classMethods: {
      associate: function(models) {
        models.Task.belongsToMany(models.User, { as: 'Developers', through: 'worker_tasks', foreignKey: 'taskId' })
      }
    }
  });

  return Task;
};
