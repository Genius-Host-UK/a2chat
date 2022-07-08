import ArticleItem from './ArticleItem.vue';
const STATUS_LIST = {
  published: 'published',
  draft: 'draft',
  archived: 'archived',
};

export default {
  title: 'Components/Help Center',
  component: ArticleItem,
  argTypes: {
    title: {
      defaultValue: 'Setup your account',
      control: {
        type: 'text',
      },
    },
    readCount: {
      defaultValue: 13,
      control: {
        type: 'number',
      },
    },
    category: {
      defaultValue: 'Getting started',
      control: {
        type: 'text',
      },
    },
    status: {
      defaultValue: 'Status',
      control: {
        type: 'select',
        options: STATUS_LIST,
      },
    },
    updatedAt: {
      defaultValue: '1657255863',
      control: {
        type: 'number',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { ArticleItem },
  template: '<article-item v-bind="$props" ></article-item>',
});

export const ArticleItemView = Template.bind({});
ArticleItemView.args = {
  title: 'Setup your account',
  author: {
    name: 'John Doe',
  },
  category: 'Getting started',
  readCount: 12,
  status: 'published',
  updatedAt: '1657255863',
};
