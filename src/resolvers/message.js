import uuidv4 from "uuid/v4";
import pubsub, { EVENTS } from "../subscription";

export default {
  Query: {
    messages: async (parent, args, { models }) => {
      return await models.Message.findAll();
    },
    message: async (parent, { id }, { models }) => {
      return await models.Message.findByPk(id);
    }
  },
  Mutation: {
    createMessage: async (parent, { text }, { me, models }) => {
      console.log("text", text);
      console.log("me", me);
      const message = await models.Message.create({
        text,
        userId: me.id
      });

      pubsub.publish(EVENTS.MESSAGES.CREATED, {
        messageCreated: { message }
      });

      return message;
    },
    deleteMessage: async (parent, { id }, { models }) => {
      return await models.Message.destroy({ where: { id } });
    }
  },
  Message: {
    user: async (message, args, { models }) => {
      return await models.User.findByPk(message.userId);
    }
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGES.CREATED)
    }
  }
};
