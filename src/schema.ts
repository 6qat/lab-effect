import { Either, Schema } from 'effect';

const MySimpleSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  isActive: Schema.Boolean,
});

const decoded = Schema.decode(MySimpleSchema)({
  id: '1',
  title: 'Hello',
  isActive: true,
});

console.log(decoded);

const decodedUnknown = Schema.decodeUnknown(MySimpleSchema)({
  id: '1',
  title: 'Hello',
  isActive: true,
});

console.log(decodedUnknown);

const decodedUnknownEither = Schema.decodeUnknownEither(MySimpleSchema)({
  id: '1',
  title: 'Hello',
  //   isActive: true,
});

if (Either.isRight(decodedUnknownEither)) {
  console.log(decodedUnknownEither.right);
} else {
  console.log(decodedUnknownEither.left.message);
}

const NumberFromString = Schema.NumberFromString;
const _number = Schema.decode(NumberFromString)('123'); // 123 (number)

// ================================================================

console.log('=================================================');
const MySimpleSchema2 = Schema.Struct({
  id: Schema.String,
  //   title: Schema.Union(Schema.String, Schema.Null),
  //   title: Schema.NullOr(Schema.String),
  //   title: Schema.UndefinedOr(Schema.String),
  //   title: Schema.optional(Schema.String),
  title: Schema.String.pipe(
    // Schema.filter((s) => s.trim() === s),
    Schema.trimmed(),
    // Schema.filter((s) =>
    //   s.length >= 3 ? true : "Value must have a min lenght of 3 "
    // )
    Schema.minLength(3),
  ),
  isActive: Schema.Boolean,
});

const decodedUnknownEither2 = Schema.decodeUnknownEither(MySimpleSchema2)({
  id: '1',
  //   title: null,
  title: 'asd',
  isActive: true,
});

if (Either.isRight(decodedUnknownEither2)) {
  console.log(decodedUnknownEither2.right);
} else {
  console.log(decodedUnknownEither2.left.message);
}

// ================================================================

const TrimmedString = Schema.transform(Schema.String, Schema.String, {
  decode: (x) => x.trim(),
  encode: (x) => x,
});

const MySimpleSchema3 = Schema.Struct({
  id: Schema.String,
  title: TrimmedString,
  isActive: Schema.Boolean,
});

type MySimpleSchema3Type = Schema.Schema.Type<typeof MySimpleSchema3>;
type MySimpleSchema3Type2 = typeof MySimpleSchema3.Type;
interface MySimpleSchema3Type3
  extends Schema.Schema.Type<typeof MySimpleSchema3> {}

const decodedUnknownEither3 = Schema.decodeUnknownEither(MySimpleSchema3)({
  id: '1',
  title: 'asd ',
  isActive: true,
});

if (Either.isRight(decodedUnknownEither3)) {
  console.log(decodedUnknownEither3.right);
} else {
  console.log(decodedUnknownEither3.left.message);
}
