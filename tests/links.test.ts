import { describe, expect, it } from "vitest";
import { formatNumber, whatsappChatUrl, whatsappContactRow } from "@/lib/whatsapp/links";

// The WhatsApp button and the contact page's WhatsApp row both depend on these.

describe("public WhatsApp links", () => {
  it("formats an Indian mobile the way people write it", () => {
    expect(formatNumber("919490729484")).toBe("+91 94907 29484");
    expect(formatNumber("15550001111")).toBe("+15550001111");
  });

  it("opens a chat with Vamscore's number and the message pre-typed", () => {
    const url = new URL(whatsappChatUrl()!);
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/919490729484");
    expect(url.searchParams.get("text")).toBe("Hi Vamscore, I'd like to talk about working with you.");
  });

  it("encodes the pre-typed message, so it cannot break the link", () => {
    const url = new URL(whatsappChatUrl("Hi & hello? #1")!);
    expect(url.searchParams.get("text")).toBe("Hi & hello? #1");
  });

  it("gives the contact page one WhatsApp row", () => {
    expect(whatsappContactRow()).toEqual([
      {
        label: "WhatsApp",
        value: "+91 94907 29484",
        href: "https://wa.me/919490729484?text=Hi%20Vamscore%2C%20I'd%20like%20to%20talk%20about%20working%20with%20you.",
      },
    ]);
  });
});
