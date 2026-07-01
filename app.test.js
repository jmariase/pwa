import { formatBytes, timeAgo, calculateScore } from "./utils.js";

describe("Utility functions test suite", () => {
  describe("formatBytes", () => {
    test("should format 0 bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
    });

    test("should format KB correctly", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(2048)).toBe("2 KB");
    });

    test("should format MB correctly", () => {
      expect(formatBytes(1048576)).toBe("1 MB");
    });

    test("should handle decimal formatting", () => {
      expect(formatBytes(1500, 1)).toBe("1.5 KB");
    });
  });

  describe("timeAgo", () => {
    test("should format recent event as just now", () => {
      const now = new Date();
      expect(timeAgo(now.getTime() - 1000)).toBe("just now");
    });

    test("should format minutes elapsed", () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(timeAgo(fiveMinsAgo)).toBe("5 mins ago");
    });

    test("should format hours elapsed", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(timeAgo(twoHoursAgo)).toBe("2 hours ago");
    });

    test("should format days elapsed", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(timeAgo(threeDaysAgo)).toBe("3 days ago");
    });
  });

  describe("calculateScore", () => {
    test("should return 100 with zero issues", () => {
      expect(calculateScore(0, 0, 0)).toBe(100);
    });

    test("should apply penalties for bugs and issues", () => {
      // 100 - (1 * 5) - (1 * 10) - (2 * 2) = 100 - 5 - 10 - 4 = 81
      expect(calculateScore(1, 1, 2)).toBe(81);
    });

    test("should not drop below 0", () => {
      expect(calculateScore(10, 10, 10)).toBe(0);
    });
  });
});
