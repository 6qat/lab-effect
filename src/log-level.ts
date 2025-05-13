import { BunRuntime } from '@effect/platform-bun';
import { Effect, Fiber, Layer, LogLevel, Logger } from 'effect';
import { pipe } from 'effect';
import { Context } from 'effect';

interface MyServiceShape {
  readonly doSomething: () => Effect.Effect<void>;
}

class MyService extends Context.Tag('MyService')<MyService, MyServiceShape>() {}

const makeEffect = Effect.gen(function* () {
  yield* Effect.logDebug('from Outside!');
  const fiber = yield* pipe(
    Effect.gen(function* () {
      yield* Effect.logDebug('from Fiber!');
      yield* Effect.sleep('1 second');
    }),
    Effect.fork,
  );
  yield* Fiber.join(fiber);
  return MyService.of({
    doSomething: () => Effect.logDebug('from MyService!'),
  });
});

const makeLayer = Layer.effect(
  MyService,
  makeEffect.pipe(Logger.withMinimumLogLevel(LogLevel.Debug)),
);

const program = Effect.gen(function* () {
  const service = yield* MyService;
  yield* service.doSomething();
  yield* Effect.logDebug('From Program');
});

const loggerLayer = Logger.minimumLogLevel(LogLevel.Debug);

BunRuntime.runMain(
  Effect.provide(program, Layer.merge(loggerLayer, makeLayer)),
);
