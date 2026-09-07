import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

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
    </>
  );
}
