import { frontendURL } from 'dashboard/helper/URLHelper';
import { defineAsyncComponent } from 'vue';

import {
  ROLES,
  CONVERSATION_PERMISSIONS,
} from 'dashboard/constants/permissions.js';
const SettingsContent = defineAsyncComponent(() => import('../Wrapper.vue'));
const SettingsWrapper = defineAsyncComponent(
  () => import('../SettingsWrapper.vue')
);
const Macros = defineAsyncComponent(() => import('./Index.vue'));
const MacroEditor = defineAsyncComponent(() => import('./MacroEditor.vue'));

export default {
  routes: [
    {
      path: frontendURL('accounts/:accountId/settings/macros'),
      component: SettingsWrapper,
      children: [
        {
          path: '',
          name: 'macros_wrapper',
          component: Macros,
          meta: {
            permissions: [...ROLES, ...CONVERSATION_PERMISSIONS],
          },
        },
      ],
    },
    {
      path: frontendURL('accounts/:accountId/settings/macros'),
      component: SettingsContent,
      props: () => {
        return {
          headerTitle: 'MACROS.HEADER',
          icon: 'flash-settings',
          showBackButton: true,
        };
      },
      children: [
        {
          path: ':macroId/edit',
          name: 'macros_edit',
          component: MacroEditor,
          meta: {
            permissions: [...ROLES, ...CONVERSATION_PERMISSIONS],
          },
        },
        {
          path: 'new',
          name: 'macros_new',
          component: MacroEditor,
          meta: {
            permissions: [...ROLES, ...CONVERSATION_PERMISSIONS],
          },
        },
      ],
    },
  ],
};
