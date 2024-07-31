import TemplateParser from '../../../../dashboard/components/widgets/conversation/WhatsappTemplates/TemplateParser.vue';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import { templates } from './fixtures';
const localVue = createLocalVue();
import VueI18n from 'vue-i18n';
import i18n from 'dashboard/i18n';
import { nextTick } from 'vue';

localVue.use(VueI18n);

const i18nConfig = new VueI18n({ locale: 'en', messages: i18n });
const config = {
  localVue,
  i18n: i18nConfig,
  stubs: {
    WootButton: { template: '<button />' },
    WootInput: { template: '<input />' },
  },
};

describe('#WhatsAppTemplates', () => {
  it('returns all variables from a template string', async () => {
    const wrapper = shallowMount(TemplateParser, {
      ...config,
      propsData: { template: templates[0] },
    });
    await nextTick();
    expect(wrapper.vm.variables).toEqual(['{{1}}', '{{2}}', '{{3}}']);
  });

  it('returns no variables from a template string if it does not contain variables', async () => {
    const wrapper = shallowMount(TemplateParser, {
      ...config,
      propsData: { template: templates[12] },
    });
    await nextTick();
    expect(wrapper.vm.variables).toBeNull();
  });

  it('returns the body of a template', async () => {
    const wrapper = shallowMount(TemplateParser, {
      ...config,
      propsData: { template: templates[1] },
    });
    await nextTick();
    const expectedOutput =
      templates[1].components.find(i => i.type === 'BODY')?.text || '';
    expect(wrapper.vm.templateString).toEqual(expectedOutput);
  });
  it('generates the templates from variable input', async () => {
    const wrapper = shallowMount(TemplateParser, {
      ...config,
      propsData: { template: templates[0] },
    });
    await nextTick();
    await wrapper.setData({
      processedParams: { 1: 'abc', 2: 'xyz', 3: 'qwerty' },
    });
    await nextTick();
    const expectedOutput =
      'Esta é a sua confirmação de voo para abc-xyz em qwerty.';
    expect(wrapper.vm.processedString).toEqual(expectedOutput);
  });
});
