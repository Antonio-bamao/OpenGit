export function getNextDistDir(nodeEnv) {
  return nodeEnv === "production" ? ".next-build" : ".next-dev";
}
