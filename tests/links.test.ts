import { describe, expect, it } from "vitest";
import { formatNumber, whatsappChatUrl, whatsappContactRow } from "@/lib/whatsapp/links";
import { FOOTER_COLUMNS, GMAIL_COMPOSE_URL } from "@/content/nav";
import { INTERNSHIP } from "@/content/home";

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

  it("opens the internship chat with its own pre-typed message", () => {
    const url = new URL(whatsappChatUrl(INTERNSHIP.prefill)!);
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/919490729484");
    expect(url.searchParams.get("text")).toBe("Hi Vamscore, I'm interested in an internship.");
  });

  it("lists Internships in the footer's Services column, linking to the home-page band", () => {
    const services = FOOTER_COLUMNS.find((c) => c.heading === "Services")!;
    const link = services.links.find((l) => l.label === "Internships")!;
    // Same page, same tab: the band's own button is what opens WhatsApp.
    expect(link.href).toBe("/#internships");
    expect(link.external).toBeUndefined();
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

describe("Gmail compose button", () => {
  it("opens a compose window addressed to info@vamscore.com", () => {
    const url = new URL(GMAIL_COMPOSE_URL);
    expect(url.origin).toBe("https://mail.google.com");
    expect(url.searchParams.get("view")).toBe("cm");
    expect(url.searchParams.get("to")).toBe("info@vamscore.com");
  });

  it("does not pin the first Google account", () => {
    expect(new URL(GMAIL_COMPOSE_URL).pathname).not.toMatch(/\/u\/\d/);
  });
});
