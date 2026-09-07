// Downloads every image / video / logo used by the kyndryl.com/in/en homepage
// into public/assets/ so the clone runs fully offline.
//
//   npm run assets          fetch anything missing
//   npm run assets -- --force   re-fetch everything
//
// URLs were captured from the live page DOM (img.currentSrc, <source>, <video>,
// and computed background-image values).

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "assets");
const FORCE = process.argv.includes("--force");

const S7_IMG = "https://s7d1.scene7.com/is/image/kyndryl/";
const S7_VID = "https://s7d1.scene7.com/is/content/kyndryl/";
const DAM = "https://www.kyndryl.com/content/dam/kyndrylprogram/";

/** @type {{url: string, dir: string, name: string}[]} */
const MANIFEST = [
  // ---- brand + chrome -----------------------------------------------------
  { url: "https://www.kyndryl.com/etc.clientlibs/kyndrylprogram/clientlibs/clientlib-site/resources/images/logo-kyndryl-red.svg", dir: "logos", name: "kyndryl-logo" },
  { url: `${S7_VID}Kyndryl_Logo_footer?qlt=85&dpr=off`, dir: "logos", name: "kyndryl-logo-footer" },
  { url: `${DAM}en/global/social/linkedin-dark.svg`, dir: "logos", name: "linkedin" },
  { url: `${DAM}en/global/social/twitter-dark.svg`, dir: "logos", name: "twitter" },
  { url: `${DAM}en/services/platform/trellis.svg`, dir: "logos", name: "trellis" },

  // ---- hero carousel ------------------------------------------------------
  { url: `${S7_VID}prr-animated-main-image-16x9-0x720-3000k`, dir: "video", name: "hero-modernization" },
  { url: `${S7_VID}slide-2?dpr=on,2`, dir: "video", name: "hero-slide-2" },
  { url: `${S7_IMG}prr-animated-main-image-16x9`, dir: "img", name: "hero-modernization-poster" },
  { url: `${S7_IMG}prr-landing%20page%20banner-16x9`, dir: "img", name: "hero-people-readiness" },
  { url: `${S7_IMG}AdobeStock_463982364-thumbnail`, dir: "img", name: "hero-cloud-uplift" },
  { url: `${S7_IMG}ki-logo`, dir: "logos", name: "kyndryl-institute" },
  { url: `${S7_IMG}modernize-assessment-thumbnail`, dir: "img", name: "hero-modernization-assessment" },
  { url: `${S7_IMG}solar-panels-field_1x1`, dir: "img", name: "hero-sustainability" },
  { url: `${S7_IMG}values_lead_1x1`, dir: "img", name: "hero-our-values" },
  { url: `${S7_IMG}woman-paying-with-phone`, dir: "img", name: "hero-voice-banking" },
  { url: `${S7_IMG}european_tourist3a`, dir: "img", name: "hero-alpitour" },

  // ---- video feature ------------------------------------------------------
  { url: `${S7_IMG}Martin-convo-lamp-dimmed-home-v1?dpr=on,2`, dir: "img", name: "conversations-poster" },
  { url: `${S7_VID}kyndryl-conversations-ep1-teaser`, dir: "video", name: "conversations-ep1-teaser" },

  // ---- analyst recognition ------------------------------------------------
  { url: `${S7_IMG}isg-logo?fmt=png-alpha`, dir: "logos", name: "isg" },
  { url: `${S7_IMG}gartner-logo-updated?fmt=png-alpha`, dir: "logos", name: "gartner" },
  { url: `${S7_IMG}IDC-logo?fmt=png-alpha`, dir: "logos", name: "idc" },
  { url: `${S7_IMG}wallstreet-logo?fmt=png-alpha`, dir: "logos", name: "wsj" },

  // ---- customer stories ---------------------------------------------------
  { url: `${S7_IMG}Grameen_21x9?qlt=85`, dir: "img", name: "story-creditaccess-grameen" },

  // ---- AI-native band -----------------------------------------------------
  { url: `${S7_IMG}ai-campaign-leadspace-v3:16x9_Small?qlt=85`, dir: "img", name: "ai-native-leadspace" },

  // ---- trends and insights ------------------------------------------------
  { url: `${S7_IMG}ai-driving-new-business-models-poster:16x9_Small?qlt=85`, dir: "img", name: "insight-business-models" },
  { url: `${S7_IMG}industrial-age-ai-16x9:16x9_Small?qlt=85`, dir: "img", name: "insight-industrial-age-ai" },
  { url: `${S7_IMG}sustainable-data-reporting-16x9:16x9_Small?qlt=85`, dir: "img", name: "insight-sustainability-gap" },

  // ---- expertise ----------------------------------------------------------
  { url: `${S7_IMG}lingraju-sawkar-10-25-2x1-01?qlt=85`, dir: "img", name: "expert-lingraju-sawkar" },
  { url: `${S7_IMG}hitesh-shah-2x1`, dir: "img", name: "expert-hitesh-shah" },
  { url: `${S7_IMG}hussain-zaidi-2x1-01?qlt=85`, dir: "img", name: "expert-hussain-zaidi" },

  // ---- alliance partners --------------------------------------------------
  ...[
    ["Microsoft-logo.svg", "microsoft"],
    ["Google-Cloud-logo.svg", "google-cloud"],
    ["AWS-color-logo.svg", "aws"],
    ["Cisco-logo.svg", "cisco"],
    ["SAP-logo.svg", "sap"],
    ["Dell-Technologies-logo.svg", "dell"],
    ["Paloalto-logo.svg", "paloalto"],
    ["Oracle-logo.svg", "oracle"],
  ].map(([remote, name]) => ({
    url: `${DAM}images/alliance-assets/logo-scroll/svg/${remote}`,
    dir: "logos",
    name,
  })),
  { url: `${DAM}images/alliance-assets/databricks/databricks-4x3.svg`, dir: "logos", name: "databricks" },

  // ---- people grid / brand film -------------------------------------------
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13].map((n) => ({
    url: `${S7_IMG}${n}_people_kyndryl`,
    dir: "img",
    name: `people-${String(n).padStart(2, "0")}`,
  })),
  { url: `${S7_IMG}kyn_vid_0`, dir: "img", name: "brand-video-poster" },
  ...[1, 2, 3, 4, 5].map((n) => ({
    url: `${S7_IMG}0${n}-anthem-thumbs`,
    dir: "img",
    name: `anthem-thumb-0${n}`,
  })),
];

// Scene7 content-negotiates, so the extension has to come from the response,
// not from the URL (which usually has none at all).
const EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
};

const exists = (p) => access(p).then(() => true, () => false);

async function fetchOne({ url, dir, name }) {
  if (!FORCE) {
    for (const ext of Object.values(EXT)) {
      if (await exists(join(OUT, dir, `${name}.${ext}`))) return { name, skipped: true };
    }
  }

  const res = await fetch(url, {
    headers: {
      // Scene7 and the AEM DAM both 403 a bare programmatic request.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Referer: "https://www.kyndryl.com/in/en",
      // Deliberately excludes avif/webp: asking only for the classic formats
      // keeps every downloaded file a predictable .jpg / .png / .svg.
      Accept: "image/jpeg,image/png,image/svg+xml,video/mp4,*/*;q=0.5",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const type = (res.headers.get("content-type") || "").split(";")[0].trim();
  const ext = EXT[type];
  if (!ext) throw new Error(`unexpected content-type "${type}"`);

  const buf = Buffer.from(await res.arrayBuffer());
  const target = join(OUT, dir, `${name}.${ext}`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buf);
  return { name: `${name}.${ext}`, bytes: buf.length, type };
}

const results = await Promise.allSettled(MANIFEST.map(fetchOne));

let ok = 0;
let skipped = 0;
const failed = [];
results.forEach((r, i) => {
  if (r.status === "rejected") {
    failed.push(`${MANIFEST[i].dir}/${MANIFEST[i].name} — ${r.reason.message}`);
  } else if (r.value.skipped) {
    skipped += 1;
  } else {
    ok += 1;
    const kb = (r.value.bytes / 1024).toFixed(0).padStart(6);
    console.log(`  ${kb} KB  ${MANIFEST[i].dir}/${r.value.name}  (${r.value.type})`);
  }
});

console.log(
  `\n${ok} downloaded, ${skipped} already present, ${failed.length} failed (of ${MANIFEST.length}).`
);
if (failed.length) {
  console.error("\nFailed:");
  failed.forEach((f) => console.error("  " + f));
  process.exitCode = 1;
}
