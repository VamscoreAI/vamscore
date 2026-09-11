import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

// Every page in this group inherits the global chrome, so adding
// app/(site)/what-we-do/page.tsx is all an inner page needs.
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      {/* Fixed-position, so its place in the tree only sets tab order: last,
          after the footer, which is where a floating extra belongs. */}
      <WhatsAppButton />
    </>
  );
}
