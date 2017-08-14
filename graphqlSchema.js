var models = require('./models');
import {resolver, attributeFields} from 'graphql-sequelize';
import {GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull, GraphQLList, GraphQLSchema, GraphQLInt, GraphQLString} from 'graphql';
import {_} from 'underscore';
import Promise from 'bluebird';


let taskType = new GraphQLObjectType({
  name: 'Task',
  description: 'A task',
  // Here we define fields manually.
  // We could use graphql-sequelize's attributeFields if we chose to. (see below)
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The id of the task.',
    },
    title: {
      type: GraphQLString,
      description: 'The title of the task.',
    }
  }
});

let userType = new GraphQLObjectType({
  name: 'User',
  description: 'A user',
  // And here, we do use graphql-sequelize's attributeFields to automatically populate fields from
  // our sequelize schema.
  fields: _.assign(attributeFields(models.User), {
    tasks: {
      type: new GraphQLList(taskType),
      resolve: function (user) {
        return user.getTasks() || [];
      }
    }
  })
});

let updateUserOptions = new GraphQLInputObjectType({
  name: 'UpdateUser',
  description: 'User updates',
  fields: {
    name: {
      type: GraphQLString
    }
  }
});

let updateTaskOptions = new GraphQLInputObjectType({
  name: 'UpdateTask',
  description: 'Task updates',
  fields: {
    title: {
      type: GraphQLString
    }
  }
});

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      user: {
        type: userType,
        // args will automatically be mapped to `where`
        args: {
          id: {
            description: 'id of the user',
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        resolve: resolver(models.User, {
          include: false // disable auto including of associations based on AST - default: true
        })
      },
      users: {
        // The resolver will use `findOne` or `findAll` depending on whether the field it's used in is a `GraphQLList` or not.
        type: new GraphQLList(userType),
        args: {
          // An arg with the key limit will automatically be converted to a limit on the target
          limit: {
            type: GraphQLInt
          },
          // An arg with the key order will automatically be converted to a order on the target
          order: {
            type: GraphQLString
          }
        },
        resolve: resolver(models.User)
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createUser: {
        type: userType,
        args: {
          name: {
            description: 'A name for the user',
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        description: 'Creates a new user',
        resolve: function(obj, {name}) {
          return models.User.create({ name });
        }
      },
      updateUser: {
        type: userType,
        args: {
          id: {
            description: 'Users Id to update',
            type: new GraphQLNonNull(GraphQLInt)
          },
          options: {
            type: updateUserOptions
          }
        },
        description: 'Updates a user',
        resolve: function(obj, { id, options }) {
          return models.User.update(options, { where: { id }});
        }
      },
      deleteUser: {
        type: userType,
        args: {
          id: {
            description: 'User Id to be deleted',
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        description: 'Deletes a user',
        resolve: function(obj, { id }) {
          return models.User.destroy({where: { id }});
        }
      },
      createTask: {
        type: taskType,
        args: {
          title: {
            description: 'A title for the task',
            type: new GraphQLNonNull(GraphQLString)
          },
          userId: {
            description: 'A id for the User',
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        description: 'Creates a new task',
        resolve: function(obj, { title, userId }) {
          return Promise.all([
            models.Task.create({ title }),
            models.User.findById(userId)
          ])
          .spread((created, user) => user.addTask(created));
        }
      },
      updateTask: {
        type: taskType,
        args: {
          id: {
            description: 'Tasks Id to update',
            type: new GraphQLNonNull(GraphQLInt)
          },
          options: {
            type: updateTaskOptions
          }
        },
        description: 'Updates a task',
        resolve: function(obj, { id, options }) {
          return models.Task.update(options, { where: { id }});
        }
      },
      deleteTask: {
        type: taskType,
        args: {
          id: {
            description: 'Task Id to be deleted',
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        description: 'Deletes a task',
        resolve: function(obj, { id }) {
          return models.Task.destroy({where: { id }});
        }
      }
    }
  })
});



module.exports = schema;