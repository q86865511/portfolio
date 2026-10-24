import { Providers } from "./providers";
import { HomeView } from "@/components/HomeView";
import { eduItems, profile } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";

// 結構化資料(schema.org Person):讓搜尋引擎把姓名、學歷與 GitHub / LinkedIn 連成同一人。
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.nameEn,
  alternateName: [profile.nameZh, "Terry Chou"],
  url: SITE_URL,
  email: `mailto:${profile.email}`,
  jobTitle: "Full-stack / AI-ML Deployment / DevOps Engineer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Taoyuan",
    addressCountry: "TW",
  },
  alumniOf: eduItems.map((e) => ({
    "@type": "CollegeOrUniversity",
    name: e.schoolEn,
    alternateName: e.schoolZh,
  })),
  sameAs: [profile.github, profile.linkedin],
};

export default function Page() {
  return (
    <Providers>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomeView />
    </Providers>
  );
}
