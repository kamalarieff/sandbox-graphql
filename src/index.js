import cors from "cors";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import schema from "./schema";
import resolvers from "./resolvers";
import models, { sequelize } from "./models";
import http from "http";

const app = express();

// app.use(cors);

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req, connection }) => {
    console.log("req", req);
    console.log("connection", connection);

    if (connection) {
      return {
        models
      };
    }

    if (req) {
      return {
        models,
        me: await models.User.findByLogin("kamal")
      };
    }
  }
});

server.applyMiddleware({ app, path: "/graphql" });

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUserWithMessages();
  }
  httpServer.listen({ port: 8000 }, () => {
    console.log("Apollo Server on http://localhost:8000/graphql");
  });
});

const createUserWithMessages = async () => {
  await models.User.create(
    {
      username: "kamal",
      messages: [
        {
          text: "Hi my name is kamal"
        }
      ]
    },
    {
      include: [models.Message]
    }
  );

  await models.User.create(
    {
      username: "arieff",
      messages: [
        {
          text: "Stranger things"
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
};
