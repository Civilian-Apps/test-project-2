export function getEnvVar(varValue: string | undefined, varName: string): string {
  if (varValue === undefined) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return `MISSING_${varName}`;
    }
    throw new ReferenceError(`Reference to undefined env var: ${varName}`);
  }
  return varValue;
}
