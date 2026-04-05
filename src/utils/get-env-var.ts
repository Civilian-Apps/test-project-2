export function getEnvVar(varValue: string | undefined, varName: string): string {
  if (varValue === undefined) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      // Return valid placeholder values during build so clients don't throw
      if (varName.includes('URL')) return 'https://placeholder.example.com';
      if (varName.includes('KEY')) return 'placeholder_key';
      return 'placeholder';
    }
    throw new ReferenceError(`Reference to undefined env var: ${varName}`);
  }
  return varValue;
}
