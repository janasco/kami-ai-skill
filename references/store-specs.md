# Store screenshot specifications

Verified against Apple's App Store Connect help and Google Play Console help,
September 2026. Sources:
[Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
·
[Google Play preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)

These values are mirrored in `lib/devices.ts`; update both together.

## Hard rules that get uploads rejected

- **No alpha channel, no transparency** — both stores. Export opaque PNG.
- PNG or JPEG only. Google Play: 24-bit PNG (no alpha) or JPEG, ≤ 8 MB.
- Apple: 1–10 screenshots per device per locale. Google Play: up to **8 per
  device type**; minimum **2** across device types to publish.
- Apple auto-scales: if you only upload 6.9" iPhone shots, smaller iPhone
  classes are derived. The inverse is not true.

## iPhone (App Store)

| Class | Portrait | Landscape | Note |
| --- | --- | --- | --- |
| **6.9"** (16 Pro Max, 15 Pro Max…) | **1320×2868** | 2868×1320 | Also accepted: 1290×2796, 1260×2736 |
| 6.5" | 1284×2778 or 1242×2688 | 2778×1284 / 2688×1242 | Optional (auto-scaled) |
| 6.3" | 1206×2622 or 1179×2556 | 2622×1206 / 2556×1179 | Optional |
| 6.1" | 1170×2532 or 1125×2436 or 1080×2340 | — | Optional |
| 5.5" | 1242×2208 | 2208×1242 | Optional |
| 4.7" | 750×1334 | 1334×750 | Optional |

Ship **6.9" only** unless the user asks for legacy classes.

## iPad (App Store)

| Class | Portrait | Landscape |
| --- | --- | --- |
| **13"** (iPad Pro M4/M5, Air M2+) | **2064×2752** (also 2048×2732) | 2752×2064 |
| 11" | 1668×2420 / 1668×2388 / 1488×2266 | — |

## Mac (App Store)

Any one **16:10**: 1280×800, 1440×900, **2560×1600** (default export),
2880×1800.

## Apple TV / Apple Vision Pro

| Device | Size |
| --- | --- |
| Apple TV | 3840×2160 (1920×1080 also accepted) |
| Apple Vision Pro | 3840×2160 |

## Apple Watch (App Store)

One size, used **consistently across all localizations**:

| Watch | Size |
| --- | --- |
| Ultra 2/3, Series 9–12, SE 2/3 | **396×484** (S9–8 class) / 416×496 (S10+) / 410×502 (Ultra 2) |
| Series 4–6, SE | 368×448 |
| Series 3 and earlier | 312×390 |

Default export: **416×496** (current generation).

## CarPlay (App Store)

CarPlay-capable apps add screenshots at **1920×712** (landscape) or
**712×1920** (portrait) in the CarPlay section of App Store Connect.

## Google Play — phone / tablet

- Any side 320–3840 px; **long side ≤ 2× short side**.
- Recommended portrait: **1080×1920** (9:16). Recommended landscape:
  1920×1080 (16:9).
- Recommendation eligibility (apps): ≥ 4 screenshots at ≥ 1080 px, 9:16
  portrait or 16:9 landscape. Games: ≥ 3.
- Large screens (tablet/Chromebook): 16:9 landscape or 9:16 portrait,
  1080–7680 px, **minimum 4 screenshots**.
- Taglines ≤ **20% of image area**. No device imagery on Android listings.

## Google Play — feature graphic

- Exactly **1024×500**, JPEG or 24-bit PNG (no alpha). Required to publish.
- Keep the focal point centered; **cut-off zones** at edges lose content on
  some surfaces. Avoid pure white/black/dark grey backgrounds.
- No rank claims ("Best", "#1"), no CTAs, no Google Play badge, no device
  imagery.

## Google Play — Wear OS (hard rules)

Screenshots **1:1, minimum 384×384**, app interface only — **no device
frames, no backgrounds, no extra text, no transparency**. Default export:
512×512.

## Google Play — Android TV / Automotive

- Android TV: banner **1280×720** required; screenshots 16:9.
- Automotive: 2 portrait **800×1280** + 2 landscape **1024×768** (if
  distributing; generic System UI only, no OEM-specific UI).

## Default export matrix (this skill)

| Deck | Device | Portrait | Landscape |
| --- | --- | --- | --- |
| iOS | iPhone 6.9" | 1320×2868 | 2868×1320 |
| iOS | iPad 13" | 2064×2752 | 2752×2064 |
| iOS | Apple Watch | 416×496 | — |
| iOS | Apple TV | 3840×2160 | — |
| iOS | CarPlay | 1920×712 | 712×1920 |
| Mac | MacBook 16:10 | — | 2560×1600 |
| Android | Phone | 1080×1920 | 1920×1080 |
| Android | Tablet (10") | 1600×2560 | 2560×1600 |
| Android | Feature graphic | 1024×500 | — |
| Android | Wear OS | 512×512 | — |

Landscape is only exported when the deck's orientation is `landscape`.
