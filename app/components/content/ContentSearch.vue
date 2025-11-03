<!-- eslint-disable vue/block-tag-newline -->
<script lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import type { AppConfig } from '@nuxt/schema';
import type { UseFuseOptions } from '@vueuse/integrations/useFuse';
import theme from '#build/ui/content/content-search';
import type {
  ButtonProps,
  InputProps,
  LinkProps,
  ModalProps,
  CommandPaletteProps,
  CommandPaletteSlots,
  CommandPaletteGroup,
  CommandPaletteItem,
  IconProps,
  ComponentConfig,
} from '#ui/types';

import { computed, useTemplateRef } from 'vue';
import { useForwardProps } from 'reka-ui';
import { defu } from 'defu';
import { reactivePick } from '@vueuse/core';
import { useAppConfig, useColorMode, defineShortcuts } from '#imports';
import { omit, transformUI } from '#ui/utils';
import { tv } from '#ui/utils/tv';

type ContentSearch = ComponentConfig<typeof theme, AppConfig, 'contentSearch'>;

interface ContentSearchLink extends Omit<LinkProps, 'custom'> {
  label?: string;
  description?: string;
  /**
   * @IconifyIcon
   */
  icon?: IconProps['name'];
  children?: ContentSearchLink[];
}

interface ContentSearchFile {
  id: string;
  title: string;
  titles: string[];
  level: number;
  content: string;
}

interface ContentSearchItem
  extends Omit<LinkProps, 'custom'>,
          CommandPaletteItem {
            level?: number;
            /**
             * @IconifyIcon
             */
            icon?: IconProps['name'];
          }

interface ContentSearchProps<T extends ContentSearchLink = ContentSearchLink>
  extends /* @vue-ignore */ Pick<
    ModalProps,
    | 'title'
    | 'description'
    | 'overlay'
    | 'transition'
    | 'content'
    | 'dismissible'
    | 'fullscreen'
    | 'modal'
    | 'portal'
> {
  /**
   * The icon displayed in the input.
   * @defaultValue appConfig.ui.icons.search
   * @IconifyIcon
   */
  icon?: IconProps['name'];
  /**
   * The placeholder text for the input.
   * @defaultValue t('commandPalette.placeholder')
   */
  placeholder?: InputProps['placeholder'];
  /**
   * Automatically focus the input when component is mounted.
   * @defaultValue true
   */
  autofocus?: boolean;
  /** When `true`, the loading icon will be displayed. */
  loading?: boolean;
  /**
   * The icon when the `loading` prop is `true`.
   * @defaultValue appConfig.ui.icons.loading
   * @IconifyIcon
   */
  loadingIcon?: IconProps['name'];
  /**
   * Display a close button in the input (useful when inside a Modal for example).
   * `{ size: 'md', color: 'neutral', variant: 'ghost' }`{lang="ts-type"}
   * @emits 'update:open'
   * @defaultValue true
   */
  close?: boolean | Partial<ButtonProps>;
  /**
   * The icon displayed in the close button.
   * @defaultValue appConfig.ui.icons.close
   * @IconifyIcon
   */
  closeIcon?: IconProps['name'];
  /**
   * Keyboard shortcut to open the search (used by [`defineShortcuts`](https://ui.nuxt.com/docs/composables/define-shortcuts))
   * @defaultValue 'meta_k'
   */
  shortcut?: string;
  /** Links group displayed as the first group in the command palette. */
  links?: T[];
  navigation?: ContentNavigationItem[];
  /** Custom groups displayed between navigation and color mode group. */
  groups?: CommandPaletteGroup<ContentSearchItem>[];
  files?: ContentSearchFile[];
  /**
   * Options for [useFuse](https://vueuse.org/integrations/useFuse) passed to the [CommandPalette](https://ui.nuxt.com/docs/components/command-palette).
   * @defaultValue { fuseOptions: { includeMatches: true } }
   */
  fuse?: UseFuseOptions<T>;
  /**
   * When `true`, the theme command will be added to the groups.
   * @defaultValue true
   */
  colorMode?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class?: any;
  ui?: ContentSearch['slots'] &
    CommandPaletteProps<
      CommandPaletteGroup<ContentSearchItem>,
      ContentSearchItem
    >['ui'];
}

type ContentSearchSlots = CommandPaletteSlots<
  CommandPaletteGroup<ContentSearchItem>,
  ContentSearchItem
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  content(props?: {}): any;
};
</script>

<script setup lang="ts" generic="T extends ContentSearchLink">
const props = withDefaults(defineProps<ContentSearchProps<T>>(), {
  shortcut: 'meta_k',
  colorMode: true,
  close: true,
});

const slots = defineSlots<ContentSearchSlots>();

const searchTerm = defineModel<string>({ default: '' });

const { t } = useLocale();
const { open } = useContentSearch();
// eslint-disable-next-line vue/no-dupe-keys
const colorMode = useColorMode();
const appConfig = useAppConfig() as ContentSearch['AppConfig'];

const commandPaletteProps = useForwardProps(
  reactivePick(
    props,
    'icon',
    'placeholder',
    'autofocus',
    'loading',
    'loadingIcon',
    'close',
    'closeIcon',
  ),
);

const getProxySlots = () => omit(slots, ['content']);

const fuse = computed(() =>
  defu({}, props.fuse, {
    fuseOptions: {
      includeMatches: true,
    },
  }),
);

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() =>
  tv({ extend: tv(theme), ...(appConfig.ui?.contentSearch || {}) })(),
);

function mapLinksItems(links: T[]): ContentSearchItem[] {
  return links.flatMap((link) => [
    {
      ...link,
      suffix: link.description,
      icon: link.icon || appConfig.ui.icons.file,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(link.children?.map((child: any) => ({
      ...child,
      prefix: link.label + ' >',
      suffix: child.description,
      icon: child.icon || link.icon || appConfig.ui.icons.file,
    })) || []),
  ]);
}

// --- Optimization: Pre-index files for fast lookup ---
const fileIdMap = computed(() => {
  const map = new Map<string, ContentSearchFile>();
  props.files?.forEach((file) => map.set(file.id, file));
  return map;
});
const filePrefixMap = computed(() => {
  const map = new Map<string, ContentSearchFile[]>();
  props.files?.forEach((file) => {
    const prefix = file.id.split('#')[0];
    if (!prefix) return;
    if (!map.has(prefix)) map.set(prefix, []);
    map.get(prefix)!.push(file);
  });
  return map;
});

const mapNavigationItems = (
  children: ContentNavigationItem[],
  parent?: ContentNavigationItem,
): ContentSearchItem[] => {
  return children.flatMap((link) => {
    if (link.children?.length) {
      return mapNavigationItems(link.children, link);
    }
    // Use the pre-built maps for fast lookup
    const files: ContentSearchFile[] = [];
    const idFile = fileIdMap.value.get(link.path);
    if (idFile) files.push(idFile);
    const prefixFiles = filePrefixMap.value.get(link.path);
    if (prefixFiles) {
      // Avoid duplicate if idFile is also in prefixFiles
      for (const file of prefixFiles) {
        if (!files.includes(file)) files.push(file);
      }
    }
    return files.map((file) => mapFile(file, link, parent));
  });
};

function mapFile(
  file: ContentSearchFile,
  link: ContentNavigationItem,
  parent?: ContentNavigationItem,
): ContentSearchItem {
  const prefix = [...new Set([parent?.title, ...file.titles].filter(Boolean))];

  return {
    prefix: prefix?.length ? prefix.join(' > ') + ' >' : undefined,
    label: file.id === link.path ? link.title : file.title,
    suffix: file.content.replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
    to: file.id,
    icon: (link.icon ||
      parent?.icon ||
      (file.level > 1
        ? appConfig.ui.icons.hash
        : appConfig.ui.icons.file)) as string,
    level: file.level,
  };
}

const groups = computed(() => {
  const groups: CommandPaletteGroup<CommandPaletteItem>[] = [];

  if (props.links?.length) {
    groups.push({
      id: 'links',
      label: 'Titles',
      items: mapLinksItems(props.links),
    });
  }

  if (props.navigation?.length) {
    if (props.navigation.some((link) => !!link.children?.length)) {
      groups.push(
        ...props.navigation.map((group) => ({
          id: group.path,
          label: 'Content',
          items: mapNavigationItems(group.children || []),
          postFilter,
        })),
      );
    } else {
      groups.push({
        id: 'docs',
        items: mapNavigationItems(props.navigation),
        postFilter,
      });
    }
  }


  if (props.colorMode && !colorMode?.forced) {
    groups.push({
      id: 'theme',
      label: t('contentSearch.theme'),
      items: [
        {
          label: t('colorMode.system'),
          icon: appConfig.ui.icons.system,
          active: colorMode.preference === 'system',
          onSelect: () => {
            colorMode.preference = 'system';
          },
        },
        {
          label: t('colorMode.light'),
          icon: appConfig.ui.icons.light,
          active: colorMode.preference === 'light',
          onSelect: () => {
            colorMode.preference = 'light';
          },
        },
        {
          label: t('colorMode.dark'),
          icon: appConfig.ui.icons.dark,
          active: colorMode.preference === 'dark',
          onSelect: () => {
            colorMode.preference = 'dark';
          },
        },
      ],
    });
  }

  return groups;
});

function postFilter(query: string, items: ContentSearchItem[]) {
  // Filter only first level items if no query
  if (!query) {
    return items?.filter((item) => item.level === 1);
  }

  return items;
}

function onSelect(item: ContentSearchItem) {
  if (item.disabled) {
    return;
  }

  // Close modal on select
  open.value = false;
  // Reset search term on select
  searchTerm.value = '';
}

defineShortcuts({
  [props.shortcut]: {
    usingInput: true,
    handler: () => (open.value = !open.value),
  },
});

const commandPaletteRef = useTemplateRef('commandPaletteRef');

defineExpose({
  commandPaletteRef,
});
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('contentSearch.title')"
    :description="t('contentSearch.description')"
    :class="ui.modal({ class: [props.ui?.modal, props.class] })"
  >
    <template #content>
      <slot name="content">
        <CommandPalette
          ref="commandPaletteRef"
          v-model:search-term="searchTerm"
          v-bind="commandPaletteProps"
          :groups="groups"
          :fuse="fuse"
          :ui="transformUI(omit(ui, ['modal']), props.ui)"
          @update:model-value="onSelect"
          @update:open="open = $event"
        >
          <template v-for="(_, name) in getProxySlots()" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </CommandPalette>
      </slot>
    </template>
  </UModal>
</template>
