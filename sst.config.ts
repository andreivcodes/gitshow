import { SSTConfig } from "sst";
import { stack } from "./stacks/gitshow";

export default {
  config(_input) {
    return {
      name: "gitshow",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(stack);
  },
} satisfies SSTConfig;
