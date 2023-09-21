import { actions } from '../../appConfig';

const commit = jest.fn();
describe('#actions', () => {
  describe('#setReferrerHost', () => {
    it('creates actions properly', () => {
      actions.setReferrerHost({ commit }, 'www.chatwoot.com');
      expect(commit.mock.calls).toEqual([
        ['SET_REFERRER_HOST', 'www.chatwoot.com'],
      ]);
    });
  });

  describe('#setBubbleVisibility', () => {
    it('creates actions properly', () => {
      actions.setBubbleVisibility({ commit }, false);
      expect(commit.mock.calls).toEqual([['SET_BUBBLE_VISIBILITY', false]]);
    });
  });

  describe('#setWidgetColor', () => {
    it('creates actions properly', () => {
      actions.setWidgetColor({ commit }, '#eaeaea');
      expect(commit.mock.calls).toEqual([['SET_WIDGET_COLOR', '#eaeaea']]);
    });
  });

  describe('#setColorScheme', () => {
    it('creates actions for dark mode properly', () => {
      actions.setColorScheme({ commit }, 'dark');
      expect(commit.mock.calls).toEqual([['SET_COLOR_SCHEME', 'dark']]);
    });
  });

  describe('#setLocale', () => {
    it('creates actions for setting the locale properly', () => {
      actions.setLocale({ commit }, 'es_ES');
      expect(commit.mock.calls).toEqual([['SET_WIDGET_LOCALE', 'es_ES']]);
    });
  });
});
