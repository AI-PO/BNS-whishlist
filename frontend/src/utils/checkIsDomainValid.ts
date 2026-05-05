export const checkIsDomainValid = (
  domain: string
): { isValid: boolean; message?: string } => {
  if (domain.length > 16) {
    return {
      isValid: false,
      message: "Max domain length is 16 characters.",
    };
  }

  const invalidCharRegex = /[^a-z0-9-]/;
  const invalidCharMatch = domain.match(invalidCharRegex);

  if (invalidCharMatch) {
    return {
      isValid: false,
      message: `Invalid character  “${invalidCharMatch[0]}”`,
    };
  }

  return { isValid: true };
};
