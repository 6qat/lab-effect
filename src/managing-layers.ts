import { NodeRuntime } from '@effect/platform-node';
import { Effect, Context, Layer, Console, Config as ConfigE } from 'effect';

// Declaring a tag for the Config service
class Config extends Context.Tag('Config')<
  Config,
  {
    readonly getConfig: Effect.Effect<{
      readonly logLevel: string;
      readonly connection: string;
    }>;
  }
>() {}

// Layer<Config, never, never>
const ConfigLive = Layer.succeed(
  Config,
  Config.of({
    getConfig: Effect.succeed({
      logLevel: 'INFO',
      connection: 'mysql://username:password@hostname:port/database_name',
    }),
  }),
);

// Declaring a tag for the Logger service
class Logger extends Context.Tag('Logger')<
  Logger,
  { readonly log: (message: string) => Effect.Effect<void> }
>() {}

// Layer<Logger, never, Config>
const LoggerLive = Layer.effect(
  Logger,
  Effect.gen(function* () {
    const config = yield* Config;
    return Logger.of({
      log: (message) =>
        Effect.gen(function* () {
          const { logLevel } = yield* config.getConfig;
          console.log(`[${logLevel}] ${message}`);
        }),
    });
  }),
);

// Declaring a tag for the Database service
class Database extends Context.Tag('Database')<
  Database,
  { readonly query: (sql: string) => Effect.Effect<unknown> }
>() {}

// Layer<Database, never, Config | Logger>
const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* Config;
    const logger = yield* Logger;
    return Database.of({
      query: (sql: string) =>
        Effect.gen(function* () {
          yield* logger.log(`Executing query: ${sql}`);
          const { connection } = yield* config.getConfig;
          return { result: `Results from ${connection}` };
        }),
    });
  }),
);

const AppConfigLive = Layer.merge(ConfigLive, LoggerLive);
const MainLive = DatabaseLive.pipe(
  // provides the config and logger to the database
  Layer.provide(AppConfigLive),
  // provides the config to AppConfigLive
  Layer.provide(ConfigLive),
);

const program = Effect.gen(function* () {
  const database = yield* Database;
  const result = yield* database.query('SELECT * FROM users');
  return result;
}).pipe(Effect.provide(MainLive));

// NodeRuntime.runMain(program);

// =======================================================================
// Creating a layer
//           ┌─── The service to be created
//           │                ┌─── The possible error
//           │                │      ┌─── The required dependencies
//           ▼                ▼      ▼
// Layer<RequirementsOut, Error, RequirementsIn>
// =======================================================================

/* Sometimes your entire application might be a Layer, for example, an HTTP server. You can convert that layer to an effect with Layer.launch. It constructs the layer and keeps it alive until interrupted. */

class HTTPServer extends Context.Tag('HTTPServer')<HTTPServer, void>() {}

// Simulating an HTTP server
const server = Layer.effect(
  HTTPServer,
  Effect.gen(function* () {
    // const host = yield* ConfigE.string('HOST').pipe(
    //   Effect.orElse(() => Effect.succeed('localhost')),
    // );
    const host = yield* ConfigE.string('HOST');
    console.log(`Listening on http://localhost:${host}`);
  }),
).pipe(
  Layer.tap((ctx) => Console.log(`layer acquisition succeeded with:\n${ctx}`)),
  // Recover from errors during layer construction
  Layer.catchAll((configError) =>
    Layer.effect(
      HTTPServer,
      Effect.gen(function* () {
        yield* Effect.log(`Recovering from error:\n${configError}`);
        yield* Effect.log('Listening on http://localhost:3000');
      }),
    ),
  ),
);

Effect.runFork(Layer.launch(server));
/*
Output:
layer acquisition failed with:
(Missing data at HOST: "Expected HOST to exist in the process context")
*/
