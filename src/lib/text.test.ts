import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTime, parseTime, parseYoutubeIds, sanitizeFilename, uniqueName } from "./text.ts";

test("parseYoutubeIds", () => {
  const pasted = `
    https://www.youtube.com/watch?v=jNQXAC9IVRw
    https://youtu.be/dQw4w9WgXcQ?si=abc
    https://m.youtube.com/watch?feature=share&v=aqz-KE-bpKQ&t=10
    https://music.youtube.com/watch?v=jNQXAC9IVRw&list=RD123
    https://www.youtube.com/shorts/abcdefghijk
    https://example.com/watch?v=notyoutube1
  `;
  assert.deepEqual(parseYoutubeIds(pasted), ["jNQXAC9IVRw", "dQw4w9WgXcQ", "aqz-KE-bpKQ", "abcdefghijk"]);
});

test("sanitizeFilename", () => {
  assert.equal(sanitizeFilename('AC/DC: "Back in Black" <Live>?'), "ACDC Back in Black Live");
  assert.equal(sanitizeFilename("  trailing dots... "), "trailing dots");
  assert.equal(sanitizeFilename("CON"), "audio");
  assert.equal(sanitizeFilename("???"), "audio");
  assert.equal(sanitizeFilename("x".repeat(200)).length, 120);
});

test("uniqueName", () => {
  const taken = new Set<string>();
  assert.equal(uniqueName("Song", taken), "Song");
  assert.equal(uniqueName("song", taken), "song (2)");
  assert.equal(uniqueName("Song", taken), "Song (3)");
});

test("formatTime", () => {
  assert.equal(formatTime(0), "0:00.0");
  assert.equal(formatTime(59.96), "1:00.0");
  assert.equal(formatTime(125.44), "2:05.4");
});

test("parseTime", () => {
  assert.equal(parseTime("1:05.3"), 65.3);
  assert.equal(parseTime("0:08"), 8);
  assert.equal(parseTime("12,5"), 12.5);
  assert.equal(parseTime(" 2:00 "), 120);
  assert.equal(parseTime("abc"), null);
  assert.equal(parseTime("1:2:3"), null);
});
