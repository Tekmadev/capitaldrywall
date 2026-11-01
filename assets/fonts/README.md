# Fonts

| File | Use | Licence |
|---|---|---|
| `archivo-display.woff2` | Site display face (loaded by `app/fonts.ts` via `next/font/local`) | SIL OFL 1.1 (`OFL-Archivo.txt`) |
| `cdr-text.woff2` | Site body face: IBM Plex Sans, wght 400–500, Latin subset, renamed "CDR Text" (Plex is a Reserved Font Name) | SIL OFL 1.1 (`OFL-IBMPlexSans.txt`) |
| `Archivo-Expanded-ExtraBold.ttf` | Static instance for `next/og` share images (satori can't read variable fonts) | SIL OFL 1.1 |
| `IBMPlexMono-Medium.ttf` | Mono labels in share images | SIL OFL 1.1 (`OFL-IBMPlexMono.txt`) |

IBM Plex Mono for the site comes from `next/font/google` (self-hosted at build).

## Rebuilding `cdr-text.woff2`

Source: `IBMPlexSans[wdth,wght].ttf` from github.com/google/fonts (`ofl/ibmplexsans`):

```bash
fonttools varLib.instancer "IBMPlexSans[wdth,wght].ttf" wght=400:500 wdth=100 -o PlexSans-partial.ttf
pyftsubset PlexSans-partial.ttf --unicodes="<same list as Archivo>,U+2715" \
  --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk,tnum,lnum,case,frac' --flavor=woff2 --output-file=plex-sans.woff2
```

Then rename the family in the `name` table (IDs 1, 3, 4, 6, 16, 25) to "CDR Text" with fonttools before
shipping: the OFL forbids using the Reserved Font Name "Plex" on a modified version.

## Rebuilding `archivo-display.woff2`

Source: `Archivo[wdth,wght].ttf` from github.com/google/fonts (`ofl/archivo`). With fonttools:

```bash
fonttools varLib.instancer "Archivo[wdth,wght].ttf" wght=400:820 wdth=100:125 -o Archivo-partial.ttf
pyftsubset Archivo-partial.ttf \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2009,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+2122,U+2190-2193,U+2212,U+00D7" \
  --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk,tnum,lnum,case' \
  --flavor=woff2 --output-file=archivo-display.woff2
```

If the design starts using a weight below 400, above 820, or a width outside 100–125%, widen the
instancer ranges and rebuild.
