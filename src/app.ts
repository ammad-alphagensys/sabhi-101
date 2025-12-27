import express, { type Express } from "express";
import { Server } from "http";
import { businessIndustryRouter, businessRouter, userRouter } from "@/router";
import { errorMiddleware } from "@/middleware/express";
import { protect } from "@/middleware/express/auth.middleware";
import { RedisCache } from "@/library/redis-cache";
import cookieParser from "cookie-parser";
import { routeWdVersion } from "@/library/utils";
import { Constant } from "./constant";
import helmet from "helmet";
import cors from "cors";
import { apiReference } from "@scalar/express-api-reference";
import { loggerMiddleware } from "./middleware/express";

export class App {
  private static _instance: App;
  readonly app: Express;
  private _listener!: Server;

  private constructor() {
    this.app = express();
    this.initialize();
  }

  get listener(): Server {
    return this._listener;
  }

  static get instance(): App {
    if (App._instance != null) return App._instance;
    this._instance = new App();
    return App._instance;
  }

  initialize() {
    this.intializeMiddleware();
    this.initializeRouter();
  }

  private intializeMiddleware() {
    this.app.use(cors());

    this.app.set("query parser", "extended");

    // Set security HTTP headers
    // this.app.use(helmet());
    /* MIDDLEWARE:CORS */
    this.app.use(
      helmet({
        //  NOTE: Remove this line if you want to enable CSP
        //  MUST BE DISABLED IN PRODUCTION
        contentSecurityPolicy: false,
      }),
    );
    // this.app.options('*', corsPolicy);
    // this.app.use(corsPolicy);

    /* MIDDLEWARE:COOKIE-PARSER */
    this.app.use(cookieParser());

    /* MIDDLEWARE:EXPRESS_LOGGER */
    if (Constant.instance.server.nodeEnv !== "test") this.app.use(loggerMiddleware);

    /* MIDDLEWARE:BODY_PARSER */
    this.app.use(express.json());

    /* MIDDLEWARE:MAX_SIZE */
    this.app.use(express.json({ limit: "256kb" }));

    /* MIDDLEWARE:STATIC_FILES */
    // this.app.use("/static", express.static("public"));

    this.app.use(express.static("public"));

    /* MIDDLEWARE:PARSE_FORM-DATA */
    this.app.use(express.urlencoded({ extended: true, limit: "256kb" }));
  }

  private initializeRouter() {
    // this.app.get("/docs/openapi.json", (_req, res) => {
    //   res.status(200).json(openApiSpec);
    // });

    // this.app.use(
    //   "/docs",
    //   apiReference({
    //     content: openApiSpec,
    //     url: "/docs/openapi.json",
    //     theme: "purple",
    //     layout: "modern",
    //     showSidebar: true,
    //   })
    // );

    // --------------------
    // HEALTH CHECK
    // --------------------
    this.app.get("/health", (_req, res) => {
      res.json({
        success: true,
        status: "ok",
        uptime: process.uptime(),
      });
    });

    this.app.route(routeWdVersion("/")).get(async (_, res) => {
      res.redirect("/static/welcome/index.html");
    });

    /* ROUTE:PING */
    this.app.route(routeWdVersion("ping")).get(async (_, res) => {
      res.status(200).json({ ping: "Pong 😄", uptime: process.uptime() });
    });

    /* ROUTE:CLEAR-CACHE */
    this.app.route(routeWdVersion("clear-cache")).post(async (_, res) => {
      const clearCache = await RedisCache.instance.client.flushAll();
      res.status(200).json({ message: "Success :)", clearCache });
    });

    this.app.use(routeWdVersion("user"), userRouter);

    this.app.use(routeWdVersion("business-industry"), businessIndustryRouter);

    this.app.use(routeWdVersion("business"), businessRouter);

    /* MIDDLEWARE:PROTECT - CHECK_JWT_TOKEN */
    this.app.use(protect);

    /* MIDDLEWARE: ERROR */
    this.app.use(errorMiddleware);

    /* MIDDLEWARE:NOT_FOUND */
    // this.app.all("*", function (req, res) {
    //
    //   const docPath = `${req.protocol}://${req.hostname}:${req.socket.localPort}/docs`;
    //   res.status(404).json({
    //     status: "fail",
    //     message: `Ohh you are lost, can't find route ${req.url} - read the <${docPath}> API documentation to find your way back home :)`,
    //   });
    // });
  }
}
