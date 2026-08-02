import { describe, expect, it } from "vitest";
import { z } from "zod";

const contactInquirySchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(200).default("General Inquiry"),
  message: z.string().trim().min(5).max(4000),
});

const newsletterSchema = z.object({
  email: z.string().trim().email().max(255),
});

describe("Inquiries and Newsletter schemas", () => {
  it("validates valid contact inquiry input", () => {
    const valid = {
      name: "Jean Moreau",
      email: "jean@example.com",
      subject: "Archive Advice",
      message: "Hello, I would like advice on sizing for archive coats.",
    };
    const res = contactInquirySchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects invalid contact inquiry input", () => {
    const invalid = {
      name: "J",
      email: "not-an-email",
      message: "Hi",
    };
    const res = contactInquirySchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates newsletter email subscription", () => {
    const res = newsletterSchema.safeParse({ email: "collector@designersale.com.au" });
    expect(res.success).toBe(true);
  });

  it("rejects invalid newsletter email subscription", () => {
    const res = newsletterSchema.safeParse({ email: "invalid-email" });
    expect(res.success).toBe(false);
  });
});
