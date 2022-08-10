/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable arrow-body-style */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable simple-import-sort/sort */
/* eslint-disable linebreak-style */

// <!-- Reproduced from: https://github.com/mgmeyers/obsidian-kanban -->
// <!-- Author: Matthew Meyers -->

import {
    CachedMetadata,
    MarkdownRenderer,
    TFile,
    View,
    setIcon,
} from 'obsidian';

// import { t } from 'src/lang/Helpers';
import type { FilePath } from '../FileInterface';
import type TQPlugin from '../main';
import { c } from './EditorHelpers';

// quick replacement
const t = (str: string) => {
    return str;
};

const imageExt = ['bmp', 'png', 'jpg', 'jpeg', 'gif', 'svg'];
const audioExt = ['mp3', 'wav', 'm4a', '3gp', 'flac', 'ogg', 'oga'];
const videoExt = ['mp4', 'webm', 'ogv'];

const noBreakSpace = /\u00A0/g;
const illigalChars = /[!"#$%&()*+,.:;<=>?@^`{|}~/[\]\\]/g;

function sanitize(e: string): string {
    return e.replace(illigalChars, ' ').replace(/\s+/g, ' ').trim();
}

interface NormalizedPath {
    root: string;
    subpath: string;
    alias: string;
}

export function getNormalizedPath(path: string): NormalizedPath {
    const stripped = path.replace(noBreakSpace, ' ').normalize('NFC');

    // split on first occurance of '|'
    // "root#subpath##subsubpath|alias with |# chars"
    //             0            ^        1
    const splitOnAlias = stripped.split(/\|(.*)/);

    // split on first occurance of '#' (in substring)
    // "root#subpath##subsubpath"
    //   0  ^        1
    const splitOnHash = splitOnAlias[0].split(/#(.*)/);

    return {
        root: splitOnHash[0],
        subpath: splitOnHash[1] ? '#' + splitOnHash[1] : '',
        alias: splitOnAlias[1] || '',
    };
}

function getSubpathBoundary(fileCache: CachedMetadata, subpath: string) {
    if (!fileCache || !subpath) return null;

    const pathArr = subpath.split('#').filter((e) => {
        return !!e;
    });

    if (!pathArr || 0 === pathArr.length) return null;

    if (pathArr.length === 1) {
        const firstSegment = pathArr[0];

        if (firstSegment.startsWith('^')) {
            const blockId = firstSegment.slice(1).toLowerCase();
            const blockCache = fileCache.blocks;

            if (blockCache && blockCache[blockId]) {
                const block = blockCache[blockId];

                return {
                    type: 'block',
                    block,
                    start: block.position.start.offset,
                    end: block.position.end.offset,
                    startLine: block.position.start.line,
                    endLine: block.position.end.line,
                };
            }
            return null;
        }
    }

    const headingCache = fileCache.headings;
    if (!headingCache || 0 === headingCache.length) return null;

    let l = 0;
    let p = 0;
    let targetHeadingLevel = 0;
    let targetHeading = null;
    let nextHeading = null;

    for (; p < headingCache.length; p++) {
        const currentHeading = headingCache[p];

        if (targetHeading && currentHeading.level <= targetHeadingLevel) {
            nextHeading = currentHeading;
            break;
        }

        if (
            !targetHeading &&
            currentHeading.level > targetHeadingLevel &&
            sanitize(currentHeading.heading).toLowerCase() ===
                sanitize(pathArr[l]).toLowerCase()
        ) {
            l++;
            targetHeadingLevel = currentHeading.level;
            if (l === pathArr.length) {
                targetHeading = currentHeading;
            }
        }
    }

    return targetHeading
        ? {
              type: 'heading',
              current: targetHeading,
              next: nextHeading,
              start: targetHeading.position.start.offset,
              end: nextHeading ? nextHeading.position.start.offset : null,
              startLine: targetHeading.position.start.line,
              endLine: nextHeading ? nextHeading.position.end.line : null,
          }
        : null;
}

function applyCheckboxIndexes(dom: HTMLDivElement) {
    const checkboxes = dom.querySelectorAll('.task-list-item-checkbox');

    checkboxes.forEach((el, i) => {
        (el as HTMLElement).dataset.checkboxIndex = i.toString();
    });
}

function findUnresolvedLinks(
    dom: HTMLDivElement,
    taskFilePath: FilePath,
    plugin: TQPlugin,
) {
    const links = dom.querySelectorAll('.internal-link');

    links.forEach((link) => {
        const path = getNormalizedPath(link.getAttr('href'));
        const dest = plugin.app.metadataCache.getFirstLinkpathDest(
            path.root,
            taskFilePath,
        );

        if (!dest) {
            link.addClass('is-unresolved');
        }
    });
}

function handleImage(el: HTMLElement, file: TFile, plugin: TQPlugin) {
    el.empty();

    el.createEl(
        'img',
        { attr: { src: plugin.app.vault.getResourcePath(file) } },
        (img) => {
            if (el.hasAttribute('width')) {
                img.setAttribute('width', el.getAttribute('width'));
            }

            if (el.hasAttribute('height')) {
                img.setAttribute('height', el.getAttribute('height'));
            }

            if (el.hasAttribute('alt')) {
                img.setAttribute('alt', el.getAttribute('alt'));
            }
        },
    );

    el.addClasses(['image-embed', 'is-loaded']);
}

function handleAudio(el: HTMLElement, file: TFile, plugin: TQPlugin) {
    el.empty();
    el.createEl('audio', {
        attr: { controls: '', src: plugin.app.vault.getResourcePath(file) },
    });
    el.addClasses(['media-embed', 'is-loaded']);
}

function handleVideo(el: HTMLElement, file: TFile, plugin: TQPlugin) {
    el.empty();

    el.createEl(
        'video',
        { attr: { controls: '', src: plugin.app.vault.getResourcePath(file) } },
        (video) => {
            const handleLoad = () => {
                video.removeEventListener('loadedmetadata', handleLoad);

                if (video.videoWidth === 0 && video.videoHeight === 0) {
                    el.empty();
                    handleAudio(el, file, plugin);
                }
            };

            video.addEventListener('loadedmetadata', handleLoad);
        },
    );

    el.addClasses(['media-embed', 'is-loaded']);
}

async function getEmbeddedMarkdownString(
    file: TFile,
    normalizedPath: NormalizedPath,
    plugin: TQPlugin,
) {
    const fileCache = plugin.app.metadataCache.getFileCache(file);

    if (!fileCache) {
        return null;
    }

    const content = await plugin.app.vault.cachedRead(file);

    if (!normalizedPath.subpath) {
        return { markdown: content, boundary: null };
    }

    const contentBoundary = getSubpathBoundary(
        fileCache,
        normalizedPath.subpath,
    );

    if (contentBoundary) {
        return {
            markdown: content.substring(
                contentBoundary.start,
                contentBoundary.end === null ? undefined : contentBoundary.end,
            ),
            boundary: contentBoundary,
        };
    } else if (normalizedPath.subpath) {
        return {
            markdown: `${t('Unable to find')} ${normalizedPath.root}${
                normalizedPath.subpath
            }`,
            boundary: null,
        };
    }
}

// function pollForCachedSubpath (
//   file: TFile,
//   normalizedPath: NormalizedPath,
//   view: KanbanView,
//   remainingCount: number,
// ) {
//   setTimeout(async () => {
//     if (!view.plugin.windowRegistry.has(view.getWindow())) {
//       return
//     }

//     const reg = view.plugin.windowRegistry.get(view.getWindow())

//     if (reg.viewMap.has(view.id)) {
//       const { markdown } = await getEmbeddedMarkdownString(
//         file,
//         normalizedPath,
//         view,
//       )

//       if (!markdown) return

//       if (!markdown.startsWith(t('Unable to find'))) {
//         view.plugin.stateManagers.forEach(manager => {
//           manager.onFileMetadataChange()
//         })
//       } else if (remainingCount > 0) {
//         pollForCachedSubpath(file, normalizedPath, view, --remainingCount)
//       }
//     }
//   }, 2000)
// }

async function handleMarkdown(
    el: HTMLElement,
    file: TFile,
    normalizedPath: NormalizedPath,
    plugin: TQPlugin,
    depth: number,
) {
    const { markdown, boundary } = await getEmbeddedMarkdownString(
        file,
        normalizedPath,
        plugin,
    );

    if (!markdown) return;

    el.empty();
    const dom = el.createDiv();

    dom.addClasses(['markdown-preview-view', c('markdown-preview-view')]);
    dom.createDiv(c('embed-link-wrapper'), (wrapper) => {
        wrapper.createEl(
            'a',
            {
                href: el.getAttr('src') || file.basename,
                cls: `internal-link ${c('embed-link')}`,
            },
            (link) => {
                setIcon(link, 'link');
                link.setAttr('aria-label', file.basename);
            },
        );
    });

    await MarkdownRenderer.renderMarkdown(
        markdown,
        dom.createDiv(),
        file.path,
        plugin,
    );

    el.addClass('is-loaded');

    if (
        markdown.startsWith(t('Unable to find')) &&
        normalizedPath.subpath &&
        normalizedPath.subpath !== '#'
    ) {
        // pollForCachedSubpath(file, normalizedPath, plugin, 4)
    } else {
        const listItems = el.findAll('.task-list-item-checkbox');

        if (listItems?.length) {
            const fileCache = app.metadataCache.getFileCache(file);

            fileCache.listItems
                ?.filter((li) => {
                    if (!boundary) return true;
                    return (
                        li.position.start.line >= boundary.startLine &&
                        li.position.end.line <= boundary.endLine
                    );
                })
                .forEach((li, i) => {
                    if (listItems[i]) {
                        listItems[i].dataset.oStart =
                            li.position.start.offset.toString();
                        listItems[i].dataset.oEnd =
                            li.position.end.offset.toString();
                        listItems[i].dataset.src = file.path;
                    }
                });
        }
    }

    if (depth > 0) {
        await handleEmbeds(dom, file.path, plugin, --depth);
    }
}

function handleUnknownFile(el: HTMLElement, file: TFile) {
    el.addClass('is-loaded');
    el.empty();
    el.createEl(
        'a',
        {
            cls: 'file-link',
            href: el.getAttribute('src'),
            text: file.name,
        },
        (a) => {
            a.setAttribute('aria-label', t('Open in default app'));
            a.createSpan({}, (span) => setIcon(span, 'open-elsewhere-glyph'));
        },
    );
}

function handleEmbeds(
    dom: HTMLDivElement,
    filePath: FilePath,
    plugin: TQPlugin,
    depth: number,
) {
    return Promise.all(
        dom.findAll('.internal-embed').map(async (el) => {
            const src = el.getAttribute('src');
            const normalizedPath = getNormalizedPath(src);
            const target =
                typeof src === 'string' &&
                plugin.app.metadataCache.getFirstLinkpathDest(
                    normalizedPath.root,
                    filePath,
                );

            if (!(target instanceof TFile)) {
                return;
            }

            if (imageExt.contains(target.extension)) {
                return handleImage(el, target, plugin);
            }

            if (audioExt.contains(target.extension)) {
                return handleAudio(el, target, plugin);
            }

            if (videoExt.contains(target.extension)) {
                return handleVideo(el, target, plugin);
            }

            if (target.extension === 'md') {
                return handleMarkdown(
                    el,
                    target,
                    normalizedPath,
                    plugin,
                    depth,
                );
            }

            return handleUnknownFile(el, target);
        }),
    );
}

export async function renderMarkdown(
    plugin: TQPlugin,
    taskFilePath: FilePath,
    mdStr: string,
): Promise<HTMLDivElement> {
    const dom = createDiv();

    try {
        await MarkdownRenderer.renderMarkdown(mdStr, dom, taskFilePath, null);

        applyCheckboxIndexes(dom);
        findUnresolvedLinks(dom, taskFilePath, plugin);

        await handleEmbeds(dom, taskFilePath, plugin, 5);
    } catch (e) {
        console.error(e);
    }
    return dom;
}
