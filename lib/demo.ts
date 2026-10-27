// Server-wide demo flag. Defaults to on; set DEMO_MODE=false to disable.
export function demoEnabled(): boolean {
  return (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false";
}
