# Visual assets

## Illustration set (`public/media/illustrations/`)
Eight hand-painted objects generated with Higgsfield (model `gpt_image_2_5`, 1:1, 0.25 credits each on 2026-10-02): `ballot-box`, `envelope`, `slips`, `tray`, `knesset`, `microphone`, `magnifier`, `booklets`. Use them through `<Illustration name="…" />`. On a coloured surface add `mix-blend-multiply` so the white paper takes the surface colour, and keep the image out of any element that animates opacity or transform (that isolates it and the blend stops working).

To add an object in the same style, use this prompt and swap the first sentence:

> *[The object, described plainly.]* Hand-painted gouache illustration in a warm, slightly naive editorial style like a painted food-guide illustration, opaque paint with visible brush strokes and soft paper texture, three-quarter view, single object centred with generous margin, soft painted shadow underneath, pure white #FFFFFF background. No text, no letters, no numbers, no logos, no flags.
