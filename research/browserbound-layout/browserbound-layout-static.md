# BrowserBound Static Layout Capture

Capture mode: HTTP-only. No Chrome, Playwright, screenshots, colors, images, logos, or copied page text are included.
Text is represented as character counts only. Layout learning is based on HTML landmarks and non-color class tokens such as spacing, typography, grid, width, radius, border, shadow, and responsive breakpoints.

Captured at: 2026-04-17T14:07:17.116Z
Captured pages: 559
Successful pages: 547
Failed pages: 12
Concurrency: 4

## Counts By Type
| type | pages | ok | avg html KB | avg title | avg desc | avg h1 | avg h2 | avg cards | avg buttons | avg internal links |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| home | 1 | 1 | 122.1 | 84 | 186 | 2 | 9 | 56 | 22 | 22 |
| dashboard | 1 | 1 | 1015.4 | 39 | 186 | 1 | 0 | 554 | 552 | 546 |
| category | 4 | 4 | 306.6 | 68 | 133.8 | 1 | 0 | 152.5 | 150.5 | 143.8 |
| pdf-tool | 79 | 79 | 76.7 | 71.9 | 162.4 | 1 | 0 | 16.4 | 11.3 | 13.2 |
| image-tool | 131 | 124 | 72 | 74 | 149 | 1 | 0 | 13 | 9 | 11 |
| text-tool | 210 | 206 | 71.9 | 73 | 131 | 1 | 0 | 13 | 9 | 11 |
| misc-tool | 131 | 130 | 71.6 | 49 | 103 | 1 | 0 | 13 | 9 | 11 |
| help | 1 | 1 | 65.4 | 44 | 66 | 1 | 1 | 15 | 10 | 9 |
| settings | 1 | 1 | 60.9 | 38 | 69 | 0 | 0 | 10 | 8 | 9 |

## Global Non-Color Class Tokens

### Typography
| token | count |
| --- | --- |
| font-medium | 11161 |
| text-sm | 8879 |
| data-active:font-medium | 3822 |
| text-lg | 1694 |
| font-semibold | 1153 |
| text-xs | 1110 |
| font-bold | 624 |
| leading-relaxed | 618 |
| tracking-tight | 573 |
| text-base | 551 |
| md:text-5xl | 548 |
| text-3xl | 539 |
| text-xl | 36 |
| text-4xl | 19 |
| text-2xl | 10 |
| font-mono | 8 |
| leading-6 | 8 |
| tracking-wider | 8 |
| leading-[0.95] | 6 |
| file:font-medium | 5 |
| file:text-sm | 5 |
| md:text-sm | 5 |
| leading-none | 3 |
| leading-snug | 3 |

### Spacing
| token | count |
| --- | --- |
| gap-3 | 7627 |
| p-2 | 6552 |
| px-2 | 6535 |
| gap-2 | 4343 |
| group-data-[collapsible=icon]:p-2! | 3822 |
| group-has-data-[sidebar=menu-action]/menu-item:pr-8 | 3822 |
| gap-1 | 1806 |
| mx-auto | 1654 |
| px-4 | 1649 |
| gap-0 | 1638 |
| has-data-[icon=inline-end]:pr-1.5 | 1260 |
| has-data-[icon=inline-start]:pl-1.5 | 1260 |
| mb-2 | 1150 |
| mb-4 | 1145 |
| p-6 | 1143 |
| py-0.5 | 1081 |
| lg:px-8 | 1078 |
| px-3 | 1077 |
| gap-8 | 529 |
| has-data-[icon=inline-end]:pr-2 | 523 |
| mb-8 | 487 |
| md:peer-data-[variant=inset]:m-2 | 461 |
| md:peer-data-[variant=inset]:ml-0 | 461 |
| has-data-[icon=inline-start]:pl-2 | 459 |

### Layout
| token | count |
| --- | --- |
| flex | 22542 |
| items-center | 14403 |
| overflow-hidden | 6533 |
| [&_svg]:shrink-0 | 5091 |
| justify-center | 4693 |
| shrink-0 | 4526 |
| inline-flex | 2870 |
| hidden | 1116 |
| [&>svg]:shrink-0 | 1092 |
| items-start | 548 |
| aspect-square | 546 |
| group-data-[collapsible=icon]:overflow-hidden | 546 |
| max-sm:hidden | 546 |
| md:block | 546 |
| md:flex | 541 |
| overflow-auto | 541 |
| overflow-y-auto | 540 |
| sm:hidden | 524 |
| justify-between | 41 |
| grid | 35 |
| md:grid-cols-3 | 18 |
| group-aria-expanded/accordion-trigger:hidden | 8 |
| lg:grid-cols-3 | 8 |
| 2xl:grid-cols-5 | 5 |

### Sizing
| token | count |
| --- | --- |
| w-full | 10944 |
| h-9 | 3868 |
| group-data-[collapsible=icon]:size-8! | 3822 |
| [&_svg]:size-auto | 2730 |
| h-12 | 2228 |
| w-12 | 2228 |
| min-w-0 | 2189 |
| h-8 | 1624 |
| size-3.5 | 1569 |
| h-16 | 1107 |
| h-5 | 1093 |
| [&_svg]:size-4 | 1092 |
| [&>svg]:size-4 | 1092 |
| [&>svg]:size-auto | 1092 |
| group-data-[collapsible=icon]:w-(--sidebar-width-icon) | 1092 |
| w-(--sidebar-width) | 1088 |
| [&_svg:not([class*='size-'])]:size-4 | 1080 |
| h-full | 1078 |
| [&>svg]:size-3! | 1076 |
| w-fit | 1076 |
| size-5 | 1046 |
| before:w-px | 540 |
| group-data-[collapsible=offExamples]:w-0 | 466 |
| h-[calc(100vh-4rem)] | 461 |

### Surface
| token | count |
| --- | --- |
| rounded-md | 5460 |
| focus-visible:ring-2 | 4914 |
| outline-hidden | 4914 |
| ring-sidebar-ring | 4914 |
| border | 4664 |
| focus-visible:border-ring | 2358 |
| focus-visible:ring-[3px] | 2358 |
| focus-visible:ring-ring/50 | 2355 |
| aria-invalid:border-destructive | 2350 |
| aria-invalid:ring-destructive/20 | 2350 |
| dark:aria-invalid:ring-destructive/40 | 2350 |
| border-border | 1836 |
| aria-invalid:ring-[3px] | 1270 |
| dark:aria-invalid:border-destructive/50 | 1270 |
| outline-none | 1240 |
| rounded-2xl | 1164 |
| rounded-4xl | 1076 |
| border-b | 470 |
| group-data-[side=left]:border-r | 460 |
| group-data-[side=right]:border-l | 460 |
| in-data-[slot=button-group]:rounded-lg | 246 |
| rounded-[min(var(--radius-md),12px)] | 246 |
| dark:border-input | 177 |
| rounded-full | 95 |

## Full Page Metrics
| type | path | status | title | desc | h1 | h2 | cards | buttons | forms | inputs | internal links |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| home | / | 200 | 84 | 186 | 2 | 9 | 56 | 22 | 0 | 0 | 22 |
| dashboard | /dashboard | 200 | 39 | 186 | 1 | 0 | 554 | 552 | 0 | 1 | 546 |
| category | /image-tools | 200 | 74 | 149 | 1 | 0 | 141 | 139 | 0 | 1 | 133 |
| category | /misc-tools | 200 | 49 | 103 | 1 | 0 | 148 | 146 | 0 | 1 | 139 |
| category | /pdf-tools | 200 | 76 | 152 | 1 | 0 | 95 | 93 | 0 | 1 | 88 |
| category | /text-tools | 200 | 73 | 131 | 1 | 0 | 226 | 224 | 0 | 1 | 215 |
| pdf-tool | /pdf-tools/add-attachments | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/add-blank-page | 200 | 58 | 192 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/add-stamps | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/alternate-merge | 200 | 56 | 204 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/background-color | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/bmp-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/change-permissions | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/combine-single-page | 200 | 63 | 194 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/compare-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/compress | 200 | 49 | 228 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/crop-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/decrypt-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/delete-pages | 200 | 53 | 212 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/divide-pages | 200 | 76 | 152 | 1 | 0 | 18 | 11 | 0 | 0 | 13 |
| pdf-tool | /pdf-tools/edit | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/edit-attachments | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/edit-bookmarks | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/edit-metadata | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/encrypt-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/excel-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/extract-attachments | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/extract-pages | 200 | 54 | 191 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/fix-page-size | 200 | 76 | 152 | 1 | 0 | 15 | 10 | 0 | 0 | 12 |
| pdf-tool | /pdf-tools/flatten-pdf | 200 | 76 | 152 | 1 | 0 | 15 | 10 | 0 | 0 | 12 |
| pdf-tool | /pdf-tools/form-creator | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/form-filler | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/header-footer | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/heic-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/html-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/image-to-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/invert-colors | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/jpg-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/json-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/linearize-pdf | 200 | 76 | 152 | 1 | 0 | 15 | 10 | 0 | 0 | 12 |
| pdf-tool | /pdf-tools/merge | 200 | 52 | 245 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/n-up-pdf | 200 | 45 | 197 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/ocr-pdf | 200 | 76 | 152 | 1 | 0 | 15 | 10 | 0 | 0 | 12 |
| pdf-tool | /pdf-tools/organize | 200 | 49 | 221 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/page-dimensions | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/page-numbers | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-bmp | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-excel | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-greyscale | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-jpg | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-json | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-multi-tool | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-pdfa | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-png | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-ppt | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-tiff | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-webp | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-word | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/pdf-zip | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/png-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/posterize-pdf | 200 | 50 | 207 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/ppt-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/protect | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/redact-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/remove-annotations | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/remove-blank-pages | 200 | 64 | 195 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/remove-metadata | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/remove-restrictions | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/repair | 200 | 76 | 152 | 1 | 0 | 15 | 10 | 0 | 0 | 12 |
| pdf-tool | /pdf-tools/reverse-pages | 200 | 54 | 191 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/rotate | 200 | 47 | 227 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/sanitize-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/scan-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/sign | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/split | 200 | 46 | 245 | 1 | 0 | 14 | 9 | 0 | 1 | 10 |
| pdf-tool | /pdf-tools/svg-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/table-of-contents | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/text-color | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/tiff-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/txt-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/unlock | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/view-metadata | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/watermark | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/webp-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| pdf-tool | /pdf-tools/word-pdf | 200 | 76 | 152 | 1 | 0 | 17 | 12 | 0 | 0 | 14 |
| image-tool | /image-tools/add-border | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/add-logo | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/add-name-date | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/add-text | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/ai-enhancer | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/ai-generator | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/base64-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/beautify-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/black-white | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/blemish-remover | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/blur-background | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/blur-face | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/blur-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/bulk-resizer | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/censor-photo | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/chart-maker | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/check-dpi | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/circle-crop | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/cleanup-picture | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/color-palette | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/color-picker | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/colorize-photo | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/compress | HTTP 404 |  |  |  |  |  |  |  |  |  |
| image-tool | /image-tools/compress-100kb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/compress-1mb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/compress-200kb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/compress-20kb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/compress-500kb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/compress-50kb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/convert | HTTP 404 |  |  |  |  |  |  |  |  |  |
| image-tool | /image-tools/convert-dpi | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/crop | HTTP 404 |  |  |  |  |  |  |  |  |  |
| image-tool | /image-tools/edit-metadata | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/eps-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/eps-png | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/eps-svg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/favicon-generator | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/filters | HTTP 404 |  |  |  |  |  |  |  |  |  |
| image-tool | /image-tools/flip-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/font-png | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/freehand-crop | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/generate-signature | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/gif-apng | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/gif-avif | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/gif-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/gif-mp4 | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/gif-png | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/heic-avif | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/heic-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/heic-png | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/image-base64 | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/image-compressor | 200 | 74 | 149 | 1 | 0 | 15 | 9 | 0 | 1 | 10 |
| image-tool | /image-tools/image-splitter | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/image-text | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/instagram-grid | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/instagram-resize | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/join-images | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/jpg-avif | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/jpg-pdf | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/jpg-png | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/jpg-svg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/jpg-tiff | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/mb-to-kb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/merge-photo-sign | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/motion-blur | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/passport-photo | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/pdf-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/pixel-art | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/pixelate-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/png-avif | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/png-eps | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/png-gif | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/png-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/png-svg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/png-tiff | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/psd-ai | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/psd-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/psd-png | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/psd-svg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/qr-generator | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/qr-reader | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/reduce-kb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/reduce-mb | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/remove-background | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/remove-metadata | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/remove-object | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize | HTTP 404 |  |  |  |  |  |  |  |  |  |
| image-tool | /image-tools/resize-2x2 | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-35x45 | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-35x45mm | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-3x4 | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-4x6 | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-600x600 | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-a4 | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-cm | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-inches | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-mm | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-pixel | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/resize-signature | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/rotate | HTTP 404 |  |  |  |  |  |  |  |  |  |
| image-tool | /image-tools/rotate-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/round-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/square-crop | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/super-resolution | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/svg-optimizer | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/svg-png | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/tiff-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/tiff-png | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/tiff-svg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/tiff-text | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/translate-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/transparent-bg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/unblur-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/upscale-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/view-metadata | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/vsd-docx | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/vsd-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/vsd-pdf | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/vsd-pptx | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/vsdx-docx | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/vsdx-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/vsdx-pdf | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/vsdx-pptx | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/watermark | HTTP 404 |  |  |  |  |  |  |  |  |  |
| image-tool | /image-tools/watermark-image | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/webp-avif | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/webp-gif | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/webp-jpg | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/whatsapp-dp | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/youtube-banner | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| image-tool | /image-tools/zoom-out | 200 | 74 | 149 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-errors-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-line-breaks-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-line-numbers | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-prefix-to-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-quotes-to-lines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-quotes-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-quotes-to-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-random-letters-to-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-random-words-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-strikethrough-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-suffix-to-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-symbols-around-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-symbols-around-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-text-prefix | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-text-suffix | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/add-underline-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/anonymize-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/calculate-letter-sum | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/calculate-text-complexity | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/calculate-text-entropy | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/case-converter | HTTP 404 |  |  |  |  |  |  |  |  |  |
| text-tool | /text-tools/censor-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/center-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/change-text-alphabet | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/change-text-case | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/change-text-font | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/check-if-text-is-fake | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/check-text-palindrome | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-base64-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-binary-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-column-to-comma | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-comma-to-column | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-comma-to-newline | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-commas-to-spaces | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-decimal-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-digits-to-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-hexadecimal-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-letters-to-digits | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-morse-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-newline-to-comma | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-newlines-to-spaces | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-nice-columns-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-octal-to-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-spaces-to-commas | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-spaces-to-newlines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-spaces-to-tabs | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-tabs-to-spaces | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-base64 | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-binary | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-decimal | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-hexadecimal | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-image | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-lowercase | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-morse | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-nice-columns | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-octal | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-proper-case | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-title-case | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-uppercase | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/convert-text-to-url-slug | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/count-text-lines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/count-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/create-text-palindrome | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/create-zigzag-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/decrement-text-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/draw-box-around-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/duplicate-sentences-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/duplicate-text-consonants | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/duplicate-text-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/duplicate-text-vowels | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/duplicate-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/erase-letters-from-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/erase-words-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/escape-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/extract-regex-matches-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/extract-text-fragment | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/extract-text-from-bbcode | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/extract-text-from-html | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/extract-text-from-json | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/extract-text-from-xml | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/fancify-line-breaks-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/filter-paragraphs | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/filter-sentences | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/filter-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/filter-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/find-duplicate-text-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/find-duplicate-text-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/find-replace | HTTP 404 |  |  |  |  |  |  |  |  |  |
| text-tool | /text-tools/find-text-length | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/find-top-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/find-top-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/find-unique-text-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/find-unique-text-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/fix-paragraph-distance | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/flip-text-vertically | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-fake-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-text-bigrams | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-text-from-regex | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-text-n-grams | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-text-of-certain-length | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-text-skip-grams | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-text-unigrams | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-tiny-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/generate-zalgo-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/highlight-letters-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/highlight-patterns-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/highlight-regexp-matches-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/highlight-sentences-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/highlight-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/html-decode-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/html-encode-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/increase-text-spacing | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/increment-text-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/indent-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/insert-symbols-between-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/invert-text-case | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/join-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/json-parse-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/json-stringify-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/justify-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/left-align-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/left-pad-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/normalize-line-breaks-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/normalize-text-spacing | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/print-text-statistics | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/printf-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/randomize-letters-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/randomize-line-breaks-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/randomize-text-case | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/randomize-text-lines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/randomize-text-paragraphs | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/randomize-text-sentences | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/randomize-text-spacing | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/randomize-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/regexp-test-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-all-whitespace-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-duplicate-text-lines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-duplicate-text-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-empty-text-lines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-extra-spaces-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-line-breaks-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-line-numbers | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-prefix-from-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-quotes-from-lines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-quotes-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-quotes-from-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-random-letters-from-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-random-symbols-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-sentences-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-suffix-from-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-symbols-from-around-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-text-consonants | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-text-diacritics | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-text-font | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-text-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-text-prefix | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-text-punctuation | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-text-suffix | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-text-vowels | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/remove-words-from-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/repeat-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-commas-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-digits-with-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-line-breaks-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-text-consonants | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-text-letters | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-text-spaces | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-text-vowels | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/replace-words-with-digits | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/reverse-paragraphs | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/reverse-sentences | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/reverse-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/reverse-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/rewrite-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/right-align-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/right-pad-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/rot13-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/rot47-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/rotate-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/scramble-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/slice-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/sort-letters-in-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/sort-paragraphs-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/sort-sentences-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/sort-symbols-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/sort-text-lines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/sort-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/split-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/swap-letters-in-words | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/swap-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/text-diff | HTTP 404 |  |  |  |  |  |  |  |  |  |
| text-tool | /text-tools/trim-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/truncate-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/undo-zalgo-text-effect | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/unescape-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/unfake-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/unindent-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/unwrap-text-lines | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/url-decode-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/url-encode-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/visualize-text-structure | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/word-counter | HTTP 404 |  |  |  |  |  |  |  |  |  |
| text-tool | /text-tools/wrap-words-in-text | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/write-text-in-bold | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/write-text-in-cursive | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/write-text-in-italic | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/write-text-in-subscript | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| text-tool | /text-tools/write-text-in-superscript | 200 | 73 | 131 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/ab-test-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/age-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/angle-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/api-tester | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/area-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/barcode-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/base64-encoder | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/basic-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/bmi-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/break-even-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/business-card-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/case-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/character-counter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/chmod-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/coin-flip | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/color-palette-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/color-picker | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/compound-interest-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/cookie-policy-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/countdown-timer | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/cpa-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/cpc-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/cpm-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/cron-expression-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/css-formatter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/csv-to-json | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/currency-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/data-storage-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/date-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/days-between-dates | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/decision-matrix | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/dice-roller | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/diff-checker | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/disclaimer-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/discount-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/email-signature-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/emi-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/energy-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/epoch-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/expense-tracker | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/fd-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/find-replace | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/flowchart-maker | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/gpa-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/gratuity-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/gst-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/hash-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/htaccess-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/html-encoder | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/html-formatter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/internet-speed-test | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/invoice-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/ip-lookup | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/javascript-formatter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/json-formatter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/json-to-csv | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/json-validator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/jwt-decoder | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/kanban-board | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/length-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/letterhead-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/loan-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/lorem-ipsum-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/love-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/markdown-editor | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/markup-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/meeting-cost-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/meeting-time-finder | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/meta-tag-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/mind-map | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/name-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/notes | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/nps-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/number-base-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/org-chart-maker | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/password-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/payroll-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/percentage-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/pomodoro-timer | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/ppf-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/presentation-timer | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/privacy-policy-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/profit-margin-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/pto-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/qr-code-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/qr-generator | HTTP 404 |  |  |  |  |  |  |  |  |  |
| misc-tool | /misc-tools/quote-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/random-number-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/random-picker | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/regex-tester | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/robots-txt-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/roi-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/salary-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/sales-tax-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/sample-size-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/schema-markup-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/scientific-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/screen-resolution | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/sip-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/sitemap-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/speech-to-text | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/speed-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/sql-formatter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/stopwatch | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/swot-analysis | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/temperature-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/terms-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/text-cleaner | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/text-compare | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/text-to-speech | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/time-zone-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/timesheet-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/tip-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/todo-list | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/unit-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/unix-timestamp-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/url-encoder | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/url-shortener | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/username-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/utm-builder | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/uuid-generator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/volume-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/week-number-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/weight-converter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/whiteboard | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/word-counter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/work-hours-calculator | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/world-clock | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/xml-formatter | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/xml-to-json | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| misc-tool | /misc-tools/yaml-to-json | 200 | 49 | 103 | 1 | 0 | 13 | 9 | 0 | 0 | 11 |
| help | /help | 200 | 44 | 66 | 1 | 1 | 15 | 10 | 0 | 0 | 9 |
| settings | /settings | 200 | 38 | 69 | 0 | 0 | 10 | 8 | 0 | 0 | 9 |

## Failed Pages
| path | status | error |
| --- | --- | --- |
| /image-tools/compress | 404 | HTTP 404 |
| /image-tools/convert | 404 | HTTP 404 |
| /image-tools/crop | 404 | HTTP 404 |
| /image-tools/filters | 404 | HTTP 404 |
| /image-tools/resize | 404 | HTTP 404 |
| /image-tools/rotate | 404 | HTTP 404 |
| /image-tools/watermark | 404 | HTTP 404 |
| /text-tools/case-converter | 404 | HTTP 404 |
| /text-tools/find-replace | 404 | HTTP 404 |
| /text-tools/text-diff | 404 | HTTP 404 |
| /text-tools/word-counter | 404 | HTTP 404 |
| /misc-tools/qr-generator | 404 | HTTP 404 |
