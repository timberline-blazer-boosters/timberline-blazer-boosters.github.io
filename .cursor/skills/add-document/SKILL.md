---
name: add-document
description: Add a PDF to the Boosters Documents page via assets/documents and _data/documents.yml. Use when adding a contract, form, menu PDF for /documents/, or when the user mentions documents.yml.
---

# Add a document

`/documents/` loops `_data/documents.yml`. Do not create a new HTML page per file.

## Steps

1. Put the PDF in `assets/documents/` with a lowercase hyphenated name, for example `concession-stand-contract.pdf`. Keep it under GitHub’s **100 MB** file limit; compress if needed.
2. Append a row to `_data/documents.yml`:

```yaml
- title: Visible link text
  file: /assets/documents/the-file.pdf
  description: One-line summary
```

3. Hide without deleting: `published: false`.
4. Do not add the file to `header_pages` (Documents is already in the nav).
5. Publish with **publish-pages**. Open `/documents/` and confirm the link downloads/opens the PDF.

Concession **QR menus** (`/menu-school/`, `/menu-stadium/`) are a different viewer. Only use this skill for the Documents list.
