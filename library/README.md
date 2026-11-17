# Paper-Reel Kit asset library

Search `library/index.json` and open likely matches before generating new artwork. The index links to project-ready PNGs, set plates, illustrations and props in `public/`, plus local source images under `library/originals/`. Run `npm run library` after adding assets.

Save new generated originals in a topic folder under `library/originals/`. Put each selected render-ready cutout or plate in its project's `public/projects/<name>/assets/` and list it in `assets.json`. Keep reusable layers separate so characters, props and effects can be animated independently. Existing storyboards use their current `public/` paths.

[Approved motion references](../docs/MOTION-REFERENCES.md)

The index is generated for the checkout and includes local assets. Run `npm run library` after cloning to rebuild it for the files present on that machine.
