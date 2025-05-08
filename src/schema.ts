import { Either, Schema } from "effect";

const MySimpleSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  isActive: Schema.Boolean,
});

const decoded = Schema.decode(MySimpleSchema)({
  id: "1",
  title: "Hello",
  isActive: true,
});

console.log(decoded);

const decodedUnknown = Schema.decodeUnknown(MySimpleSchema)({
  id: "1",
  title: "Hello",
  isActive: true,
});

console.log(decodedUnknown);

const decodedUnknownEither = Schema.decodeUnknownEither(MySimpleSchema)({
  id: "1",
  title: "Hello",
  //   isActive: true,
});

if (Either.isRight(decodedUnknownEither)) {
  console.log(decodedUnknownEither.right);
} else {
  console.log(decodedUnknownEither.left.message);
}

const NumberFromString = Schema.NumberFromString;
const _number = Schema.decode(NumberFromString)("123"); // 123 (number)

// ================================================================

const MySimpleSchema2 = Schema.Struct({
  id: Schema.String,
  //   title: Schema.Union(Schema.String, Schema.Null),
  //   title: Schema.NullOr(Schema.String),
  //   title: Schema.UndefinedOr(Schema.String),
  //   title: Schema.optional(Schema.String),
  title: Schema.String.pipe(Schema.filter((s) => s.trim() === s)),
  isActive: Schema.Boolean,
});

const decodedUnknownEither2 = Schema.decodeUnknownEither(MySimpleSchema2)({
  id: "1",
  //   title: null,
  isActive: true,
});

if (Either.isRight(decodedUnknownEither2)) {
  console.log(decodedUnknownEither2.right);
} else {
  console.log(decodedUnknownEither2.left.message);
}
