# Hero background videos

Current files are **free Pexels stock stand-ins** (Pexels license — free for
commercial use, no attribution required). Replace them with the client's own
facility footage when it arrives — keep the same filenames:

| File           | Used on        | Current stand-in                          |
| -------------- | -------------- | ----------------------------------------- |
| `hero.mp4`     | Home page hero | Friends making a toast in a bar (6174374) |
| `filmboxx.mp4` | /filmboxx hero | Couple in a movie theater (7233480)       |
| `gymboxx.mp4`  | /gymboxx hero  | Weighted gym equipment in motion (37281136) |
| `bowlboxx.mp4` | /bowlboxx hero | Bowling ball hitting pins (7334251)       |
| `lounge.mp4`   | /lounge hero   | Whiskey at a hotel lounge bar (7426386)   |

Guidelines for replacements:

- Keep files short (10–20s loop) and compressed (H.264 MP4, ≤ 5 MB ideally;
  1920×1080 max — it sits behind a 70% dark overlay so quality loss is fine).
- No audio track needed; videos autoplay muted and loop.
- A darkened, moody grade matches the design system best.
- `filmboxx.mp4` (~22 MB) and `lounge.mp4` (~30 MB) are heavier than ideal —
  consider re-encoding before production (e.g. `ffmpeg -i in.mp4 -vf scale=1280:-2 -crf 28 out.mp4`).

Photos in `/public/images` are also Pexels stock stand-ins, referenced from
`lib/experiences.ts` and the page components.
