/**
 * Formats a size in bytes into a human-readable string.
 * @param {number} bytes The number of bytes.
 * @param {number} decimals The number of decimals to show.
 * @returns {string} The formatted string.
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Returns a human-readable "time ago" string.
 * @param {Date|string|number} timestamp The timestamp to compare.
 * @returns {string} A human-readable time difference description.
 */
export function timeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const elapsed = now - past;

  if (elapsed < msPerMinute) {
    return "just now";
  } else if (elapsed < msPerHour) {
    const mins = Math.round(elapsed / msPerMinute);
    return `${mins} min${mins > 1 ? "s" : ""} ago`;
  } else if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.round(elapsed / msPerDay);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

/**
 * Calculates a quality score (0-100) based on SonarQube metrics.
 * @param {number} bugs Number of bugs.
 * @param {number} vulnerabilities Number of vulnerabilities.
 * @param {number} codeSmells Number of code smells.
 * @returns {number} Score from 0 to 100.
 */
export function calculateScore(bugs, vulnerabilities, codeSmells) {
  const baseScore = 100;
  const penalty = (bugs * 5) + (vulnerabilities * 10) + (codeSmells * 2);
  const finalScore = baseScore - penalty;
  return Math.max(0, finalScore);
}
