/**
 * @param {{
 *   userAgent: string;
 *   platform: string;
 *   maxTouchPoints: number;
 * }} navigatorInfo
 */
export const isIOSTouchDevice = ({
  userAgent,
  platform,
  maxTouchPoints,
}) =>
  /iPhone|iPad|iPod/i.test(userAgent) ||
  (platform === "MacIntel" && maxTouchPoints > 1);
