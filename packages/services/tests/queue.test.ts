// Round-trip contract for Azure Storage Queue messages. Verifies that
// encodeJobMessage produces base64 and that decodeJobMessage reverses it,
// locking in the contract between the producer (web app) and consumer (worker).
import { describe, it, expect } from "vitest";
import { encodeJobMessage, decodeJobMessage } from "../src/queue";

describe("encodeJobMessage / decodeJobMessage", () => {
  it("produces a base64 string", () => {
    const encoded = encodeJobMessage({ type: "test.event", id: "abc" });
    expect(encoded).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  it("round-trips a generic message", () => {
    const msg = { type: "test.event" as const, id: "id-1", value: "hello" };
    const encoded = encodeJobMessage(msg);
    const decoded = decodeJobMessage(encoded);
    expect(decoded).toEqual(msg);
  });

  it("round-trips unicode and non-ASCII characters", () => {
    const msg = { type: "test.event" as const, id: "id-2", label: "Résumé 📄" };
    const encoded = encodeJobMessage(msg);
    const decoded = decodeJobMessage(encoded);
    expect(decoded).toEqual(msg);
  });

  it("pins the wire format (base64-of-JSON)", () => {
    const msg = { type: "test.event", id: "abc" };
    const expected = Buffer.from(JSON.stringify(msg)).toString("base64");
    expect(encodeJobMessage(msg)).toBe(expected);
  });

  it("throws on invalid base64 input", () => {
    expect(() => decodeJobMessage("not base64!")).toThrow();
  });

  it("throws on valid base64 but invalid JSON", () => {
    const garbage = Buffer.from("this is not json").toString("base64");
    expect(() => decodeJobMessage(garbage)).toThrow();
  });

  it("throws on empty input", () => {
    expect(() => decodeJobMessage("")).toThrow();
  });

  it("throws on decoded JSON that is not an object", () => {
    const encoded = Buffer.from(JSON.stringify("just a string")).toString("base64");
    expect(() => decodeJobMessage(encoded)).toThrow("not an object");
  });

  it("throws on missing type field", () => {
    const encoded = Buffer.from(JSON.stringify({ id: "x" })).toString("base64");
    expect(() => decodeJobMessage(encoded)).toThrow("has no type field");
  });
});