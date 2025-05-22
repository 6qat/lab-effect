import { Effect, Runtime, Layer, Logger, LogLevel } from 'effect';
import { NodeRuntime } from '@effect/platform-node';

const program = Effect.log('Application started!');

Effect.runPromise(program);
/*
Output:
timestamp=... level=INFO fiber=#0 message="Application started!"
*/

Runtime.runPromise(Runtime.defaultRuntime)(program);
/*
Output:
timestamp=... level=INFO fiber=#0 message="Application started!"
*/

const LoggerLive = Logger.minimumLogLevel(LogLevel.Debug);
const myRuntime = Effect.scoped(Layer.toRuntime(LoggerLive));

//NodeRuntime.runMain(runnable);
// Effect.runPromise(runnable);
NodeRuntime.runMain(
  Effect.gen(function* () {
    const runtime = yield* myRuntime;
    yield* Effect.succeedSome(1);
    Runtime.runPromise(runtime)(Effect.log('Hello World'));
    yield* Effect.logDebug('Hello World Interno');
    return 1;
  }),
);
