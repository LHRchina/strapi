import { trim } from 'lodash/fp';
import { template as templateUtils } from '@strapi/utils';

const { createStrictInterpolationRegExp, createLooseInterpolationRegExp } = templateUtils;

/**
 * Patterns that are unconditionally forbidden in a template body:
 *  - `<% ... %>` evaluation blocks (arbitrary JS execution) – must NOT match `<%= ... %>`
 *  - `${ ... }` JS string-interpolation syntax
 */
const FORBIDDEN_PATTERNS = [
  /<%(?!=)([\s\S]*?)%>/m,
  /\${([^{}]*)}/m,
];

const matchAll = (pattern: RegExp, src: string): string[] => {
  const results: string[] = [];
  let match: RegExpExecArray | null;
  const globalPattern = new RegExp(pattern, 'g');

  // eslint-disable-next-line no-cond-assign
  while ((match = globalPattern.exec(src)) !== null) {
    const [, group] = match;
    results.push(trim(group));
  }

  return results;
};

/** A regexp that deliberately never matches anything – used as a no-op interpolate pattern. */
const NEVER_MATCH_REGEXP = /(?!x)x/;

/**
 * Validate that a template body:
 *  1. Contains no forbidden patterns (eval blocks, JS template literals).
 *  2. Only uses interpolation variables that are in the provided allowedVars list.
 *
 * @param body       - The template string to validate (subject, bodyHtml, or bodyText).
 * @param allowedVars - Dot-notation variable names that are permitted, e.g. ["user.email", "url"].
 * @returns `true` when the template is safe, `false` otherwise.
 */
const isValidEmailTemplate = (body: string, allowedVars: string[]): boolean => {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(body)) {
      return false;
    }
  }

  // When there are no allowed vars the strict regexp would be empty and could cause a RegExp
  // parse error. In that case we use a regexp that can never match.
  const strictRegExp =
    allowedVars.length > 0
      ? createStrictInterpolationRegExp(allowedVars, '')
      : NEVER_MATCH_REGEXP;
  const looseRegExp = createLooseInterpolationRegExp('');

  const strictMatches = matchAll(strictRegExp, body);
  const looseMatches = matchAll(looseRegExp, body);

  // Any loose match that is not accounted for by the strict allow-list is invalid.
  if (looseMatches.length > strictMatches.length) {
    return false;
  }

  return true;
};

export { isValidEmailTemplate, NEVER_MATCH_REGEXP };
