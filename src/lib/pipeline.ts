import { db } from "@/db";
import { discoveries, sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DAILY_TARGET } from "@/lib/taxonomy";

/* ============================================================================
   DISCOVERY PIPELINE  (currently MOCK — see INTEGRATION POINTS below)

   Real flow once wired:
     1. fetchCandidates()  -> pull from RSS/API/crawl of active sources
     2. dedupe + cluster
     3. scoreCandidate()   -> relevance / novelty / source-trust / risk
     4. summarize()        -> Claude API: ORIGINAL "what it is" + "why it matters"
     5. applyGuardrails()  -> diversity caps so it isn't "12 more ESP32 boards"
     6. insert as status:'needs_review' for human one-click approval

   INTEGRATION POINTS (replace the mock bodies, keep the signatures):
     - fetchCandidates(): call real source URLs. Respect each source ToS and
       only use OG/press/repo-licensed images. Store image_license.
     - summarize(): call Anthropic API with process.env.ANTHROPIC_API_KEY.
       Prompt must produce an ORIGINAL paraphrase, never copy source text.
============================================================================ */

type Candidate = {
  title: string; category: string; sourceName: string; sourceUrl?: string;
  rawSummary: string; chips: string[]; relatedTags: string[]; icon: string;
};

// --- MOCK candidate pool. Replace fetchCandidates() with real source pulls. ---
const MOCK_POOL: Candidate[] = [
  { title:"CH32V003 sub-$1 RISC-V board", category:"boards", sourceName:"Sipeed", rawSummary:"Ultra-cheap 32-bit RISC-V MCU board for tiny projects.", chips:["CH32V","RISC-V"], relatedTags:["risc"], icon:"🟩" },
  { title:"Eurorack open DSP synth module", category:"crowdfunding", sourceName:"Crowd Supply", rawSummary:"Wavetable oscillator module shipping with editable firmware.", chips:["Eurorack","DSP"], relatedTags:["audio"], icon:"🎛" },
  { title:"Open USB power profiler released", category:"testing", sourceName:"GitHub", rawSummary:"Inline USB-C tester logging voltage, current and PD states.", chips:["Test","USB-C"], relatedTags:["test"], icon:"📈" },
  { title:"Open SO-101 robot arm gripper", category:"open-source", sourceName:"GitHub", rawSummary:"Low-cost 3D-printed arm adds a parallel gripper and ROS2 driver.", chips:["Robotics","ROS2"], relatedTags:["robot"], icon:"🤖" },
  { title:"New 21700 protected cell in stock", category:"components", sourceName:"Mouser", rawSummary:"High-drain protected lithium cell for portable builds.", chips:["Battery","Power"], relatedTags:["power"], icon:"🔋" },
  { title:"nRF54L15 BLE dev kit announced", category:"boards", sourceName:"Adafruit", rawSummary:"Next-gen Nordic BLE SoC kit with improved efficiency.", chips:["nRF54","BLE"], relatedTags:["esp32"], icon:"📶" },
  { title:"Seeed Fusion adds flex PCB option", category:"manufacturing", sourceName:"Seeed Studio", rawSummary:"Flexible and rigid-flex fabrication now in the quote flow.", chips:["Flex PCB"], relatedTags:["tools"], icon:"🏭" },
  { title:"Open handheld game console v2", category:"open-source", sourceName:"Crowd Supply", rawSummary:"RP2040 handheld with open schematics and a CircuitPython SDK.", chips:["Gaming","RP2040"], relatedTags:["audio"], icon:"🕹" },
  { title:"PlatformIO 7 ships faster builds", category:"tools", sourceName:"PlatformIO", rawSummary:"Build cache rework cuts incremental compile times sharply.", chips:["Toolchain"], relatedTags:["tools"], icon:"🔧" },
  { title:"Open 12-bit USB oscilloscope front-end", category:"testing", sourceName:"GitHub", rawSummary:"Two-channel analog front-end design released with calibration notes.", chips:["Test","Oscilloscope"], relatedTags:["test"], icon:"🔭" },
  { title:"Addressable RGB LED price drop", category:"components", sourceName:"DigiKey", rawSummary:"Popular WS2812-compatible LEDs see a notable bulk price cut.", chips:["LED","RGB"], relatedTags:["power"], icon:"💡" },
  { title:"Open MIDI controller framework", category:"open-source", sourceName:"GitHub", rawSummary:"Firmware framework for building custom MIDI controllers.", chips:["MIDI","Firmware"], relatedTags:["audio"], icon:"🎚" },
  { title:"ESP32-P4 high-perf dev board", category:"boards", sourceName:"Espressif", rawSummary:"Dual-core 400MHz MCU board with MIPI-CSI camera support.", chips:["ESP32-P4","Camera"], relatedTags:["esp32"], icon:"🟩" },
  { title:"Open split keyboard PCB campaign", category:"crowdfunding", sourceName:"GroupGets", rawSummary:"Hot-swap split keyboard PCB with QMK support, group buy.", chips:["Keyboard","QMK"], relatedTags:["tools"], icon:"⌨️" },
  { title:"DIY component tester gets color LCD", category:"testing", sourceName:"Hackaday.io", rawSummary:"Classic transistor tester project adds a color display.", chips:["Test","Components"], relatedTags:["test"], icon:"🔬" },
];

// INTEGRATION POINT 1 — replace with real RSS/API/crawl per active source.
async function fetchCandidates(): Promise<Candidate[]> {
  const active = await db.select().from(sources).where(eq(sources.status, "active"));
  // Mock: shuffle the pool to simulate a fresh daily crawl from `active` sources.
  void active;
  return [...MOCK_POOL].sort(() => Math.random() - 0.5);
}

// INTEGRATION POINT 2 — replace with Anthropic API call producing ORIGINAL text.
async function summarize(c: Candidate): Promise<{ summary: string; why: string }> {
  // const res = await fetch("https://api.anthropic.com/v1/messages", {
  //   method:"POST",
  //   headers:{ "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version":"2023-06-01", "content-type":"application/json" },
  //   body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:300,
  //     messages:[{ role:"user", content:`Write an ORIGINAL one-sentence summary and a one-sentence "why it matters for a hardware marketplace" for: ${c.title} — ${c.rawSummary}. Do not copy source wording.` }] }),
  // });
  // const data = await res.json(); ...parse...
  return {
    summary: c.rawSummary,
    why: `Relevant to ${c.category} sellers — drives demand for related parts and tools on the marketplace.`,
  };
}

function scoreCandidate(c: Candidate): number {
  // Weighted: relevance/novelty/trust/utility/open-ness/discussion - risk. Mocked with jitter.
  const base = 60 + Math.floor(Math.random() * 35);
  const openBonus = /open|cern|mit|gpl/i.test(c.rawSummary + c.chips.join(" ")) ? 5 : 0;
  return Math.min(98, base + openBonus);
}

// Diversity guardrails: don't let one category/source dominate the daily edition.
function applyGuardrails(scored: (Candidate & { aiScore: number })[]): (Candidate & { aiScore: number })[] {
  const sorted = [...scored].sort((a, b) => b.aiScore - a.aiScore);
  const picked: typeof sorted = [];
  const perCat: Record<string, number> = {};
  const perSrc: Record<string, number> = {};
  const CAT_CAP = 3, SRC_CAP = 2;
  for (const c of sorted) {
    if (picked.length >= DAILY_TARGET) break;
    if ((perCat[c.category] || 0) >= CAT_CAP) continue;
    if ((perSrc[c.sourceName] || 0) >= SRC_CAP) continue;
    picked.push(c);
    perCat[c.category] = (perCat[c.category] || 0) + 1;
    perSrc[c.sourceName] = (perSrc[c.sourceName] || 0) + 1;
  }
  // ensure minimum open-source representation
  return picked;
}

export async function runDiscoveryPipeline(): Promise<{ inserted: number }> {
  const candidates = await fetchCandidates();
  const scored = candidates.map((c) => ({ ...c, aiScore: scoreCandidate(c) }));
  const chosen = applyGuardrails(scored);

  let inserted = 0;
  for (const c of chosen) {
    const { summary, why } = await summarize(c);
    await db.insert(discoveries).values({
      title: c.title, summary, why, category: c.category,
      sourceName: c.sourceName, sourceUrl: c.sourceUrl, icon: c.icon,
      chips: c.chips, relatedTags: c.relatedTags, aiScore: c.aiScore,
      imageLicense: "unknown", status: "needs_review",
    });
    inserted++;
  }
  // mark sources as freshly crawled
  await db.update(sources).set({ lastSuccess: new Date() }).where(eq(sources.status, "active"));
  return { inserted };
}
