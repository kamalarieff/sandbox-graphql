import Test from "./test";
console.log("Hello ever running Node.js project.", Test);

import cors from "cors";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";

const schema = gql`
  type Query {
    users: [User!]
    me: User
    user(id: ID!): User

    messages: [Message!]!
    message(id: ID!): Message!
  }

  type User {
    id: ID!
    username: String!
    messages: [Message!]
  }

  type Message {
    id: ID!
    text: String!
    user: User!
  }

  type Mutation {
    createMessage(text: String!): Message!
  }
`;

let users = {
  1: {
    id: "1",
    username: "Robin Wieruch",
    messageIds: [1]
  },
  2: {
    id: "2",
    username: "Kamal",
    messageIds: [2]
  }
};

let messages = {
  1: {
    id: "1",
    text: "Hello World",
    userId: "1"
  },
  2: {
    id: "2",
    text: "By World",
    userId: "2"
  }
};

const resolvers = {
  Query: {
    users: (parent, args, context) => {
      return Object.values(users);
    },
    me: (parent, args, context) => {
      const { me } = context;
      return me;
    },
    user: (parent, args) => {
      const { id } = args;
      return users[id];
    },
    messages: () => {
      return Object.values(messages);
    },
    message: (_, args) => {
      const { id } = args;
      return messages[id];
    }
  },
  User: {
    messages: user => {
      console.log("user", user);
      return Object.values(messages).filter(
        message => message.userId === user.id
      );
    }
  },
  Message: {
    user: message => {
      return users[message.userId];
    }
  },
  Mutation: {
    createMessage: (parent, { text }, { me }) => {
      const message = {
        text,
        userId: me.id
      };
      return message;
    }
  }
};

const app = express();

// app.use(cors);

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    me: users[1]
  }
});

server.applyMiddleware({ app, path: "/graphql" });

app.listen({ port: 8000 }, () => {
  console.log("Apollo Server on http://localhost:8000/graphql");
});
