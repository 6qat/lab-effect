import { Either, Schema } from "effect";

const MySimpleSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  isActive: Schema.Boolean,
});

const _i = Schema.decode(MySimpleSchema)({
  id: "1",
  title: "Hello",
  isActive: true,
});

console.log(_i);
