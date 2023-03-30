import cors from "@fastify/cors";
import fastify from "fastify";
import { setupDB } from "./db";
import { middleware } from "./modules/middleware";
import { authRoutes } from "./routes/auth";
import { documentRoutes } from "./routes/document";
import { oAuthRoutes } from "./routes/oauth";
import { usersRoutes } from "./routes/users";
import { env } from "./utils/env";
import { Logger } from "./utils/logger";
import { redis, setupRedis } from "./utils/redis";

const main = async () => {
  const server = fastify({
    bodyLimit: 5000000,
  });
  setupDB();
  setupRedis();

  const API_VERSION = "v1";

  server.register(cors, {
    origin: "*",
  });

  await server.register(import("@fastify/rate-limit"), {
    global: true,
    max: 500,
    timeWindow: "1 minute",
    keyGenerator: function (request) {
      return (request.headers["x-real-ip"] ||
        request.headers["x-client-ip"] ||
        request.headers["x-forwarded-for"] ||
        request.ip) as string;
    },
  });

  server.register(middleware);
  server.get("/", async (_, reply) => {
    reply.send({
      success: true,
      data: {
        message: "Welcome to Imperial API",
      },
    });
  });
  server.get("/v1", async (_, reply) => {
    reply.send({
      success: true,
      data: {
        message: "Welcome to Imperial API",
        version: "1",
        documentation: "https://docs.imperialb.in/v1",
      },
    });
  });
  server.register(usersRoutes, { prefix: `/${API_VERSION}/users` });
  server.register(documentRoutes, { prefix: `/${API_VERSION}/document` });
  server.register(authRoutes, { prefix: `/${API_VERSION}/auth` });
  server.register(oAuthRoutes, { prefix: `/${API_VERSION}/oauth` });

  server.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      success: false,
      error: {
        message: "Route not found",
      },
    });
  });

  server.setErrorHandler((error, request, reply) => {
    Logger.error("SERVER", error.message);
    reply.code(error.statusCode ?? 500).send({
      success: false,
      error: {
        message:
          (error.statusCode ?? 500) >= 500
            ? "Internal server error"
            : error.message,
      },
    });
  });

  server.listen({ port: env.PORT }, (err, address) => {
    if (err) {
      Logger.error("INIT", err.message);
      process.exit(1);
    }

    Logger.info("INIT", `Server listening at ${address}`);
  });
};

main();
