import { describe, it, expect } from "vitest";
import { safeBlobName } from "../src/storage";

describe("safeBlobName", () => {
  it("namespaces by item id", () => {
    expect(safeBlobName("item1", "resume.pdf")).toBe("item1/resume.pdf");
  });

  it("neutralizes path traversal", () => {
    expect(safeBlobName("item1", "../../etc/passwd")).toBe("item1/__etc_passwd");
    expect(safeBlobName("item1", "a/b/c.pdf")).not.toContain("a/b");
  });

  it("handles empty and hostile names", () => {
    expect(safeBlobName("item1", "")).toBe("item1/file");
    expect(safeBlobName("item1", "  spaces & symbols!.png")).toBe("item1/__spaces___symbols_.png");
  });

  it("caps absurdly long names", () => {
    const name = safeBlobName("item1", "x".repeat(500) + ".pdf");
    expect(name.length).toBeLessThanOrEqual("item1/".length + 100);
  });
});