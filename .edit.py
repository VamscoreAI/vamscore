import io

def edit(path, pairs):
    s = io.open(path, encoding="utf-8").read()
    for old, new in pairs:
        assert s.count(old) == 1, f"{path}: {old[:80]!r}"
        s = s.replace(old, new)
    io.open(path, "w", encoding="utf-8", newline="\n").write(s)
    print("ok ", path)

edit("content/services.ts", [
 ('''  topic: string;
};

export const SERVICES_HERO = {''',
  '''  topic: string;
  /** Pictures shown under the points, in a grid. Optional; renders nothing
   *  when absent or empty. Each file needs a `.gitignore` negation. */
  gallery?: { src: string; alt: string }[];
};

export const SERVICES_HERO = {'''),
 ('''"Five lines of work, built in the order Vamscore learned them: run the process first, automate it second, take it to market with partners who need reach — and build the software a business runs on."''',
  '''"Six lines of work, built in the order Vamscore learned them: run the process first, automate it second, take it to market with partners who need reach — and build the software a business runs on, and the marketing that gets it seen."'''),
 ('''    topic: "Software or website development",
  },
];''',
  '''    topic: "Software or website development",
  },
  {
    // Added 2026-10-22 at Vamscore's request. Pictures to follow: add them to
    // `gallery` when supplied.
    id: "digital-marketing",
    title: "Digital marketing",
    body: "We keep a business visible where its customers already spend their time — planning and running its social media, and putting out the right creative for every occasion that matters to its audience.",
    points: [
      "Social media handling — content calendars, posting and replies",
      "Festival and special-occasion posters, ready on the day",
      "Account boosting — growing reach and followers with organic and paid promotion",
      "Brand creatives for posts and campaigns, in your own look",
    ],
    topic: "Digital marketing",
    gallery: [],
  },
];'''),
])

edit("content/contact.ts", [
 ('''          "Software or website development",''',
  '''          "Software or website development",
          "Digital marketing",'''),
])

edit("content/nav.ts", [
 ('''          { label: "Software and web development", href: "/services#software" },''',
  '''          { label: "Software and web development", href: "/services#software" },
          { label: "Digital marketing", href: "/services#digital-marketing" },'''),
 ('''      { label: "Software and web development", href: "/services#software" },''',
  '''      { label: "Software and web development", href: "/services#software" },
      { label: "Digital marketing", href: "/services#digital-marketing" },'''),
])

edit("tests/section-heading.test.ts", [
 ('''    expect(SERVICES_HERO.standfirst).toMatch(/^Five lines of work/);
    expect(lines.value).toBe(5);''',
  '''    expect(SERVICES_HERO.standfirst).toMatch(/^Six lines of work/);
    expect(lines.value).toBe(6);'''),
])

edit("app/(site)/services/page.tsx", [
 ('''              </ul>

              <Reveal delay={500}>''',
  '''              </ul>

              {service.gallery && service.gallery.length > 0 && (
                <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
                  {service.gallery.map((pic, j) => (
                    <Reveal key={pic.src} as="li" delay={260 + j * 80}>
                      <Image
                        src={pic.src}
                        alt={pic.alt}
                        width={600}
                        height={600}
                        sizes="(min-width: 1024px) 220px, 45vw"
                        className="aspect-square w-full rounded-2xl object-cover"
                      />
                    </Reveal>
                  ))}
                </ul>
              )}

              <Reveal delay={500}>'''),
])
