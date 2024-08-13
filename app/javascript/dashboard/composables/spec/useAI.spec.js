import { useAI } from '../useAI';
import { useStore, useStoreGetters } from 'dashboard/composables/store';
import { useAlert, useTrack } from 'dashboard/composables';
import { useI18n } from '../useI18n';
import OpenAPI from 'dashboard/api/integrations/openapi';

vi.mock('dashboard/composables/store');
vi.mock('dashboard/composables');
vi.mock('../useI18n');
vi.mock('dashboard/api/integrations/openapi');
vi.mock('dashboard/helper/AnalyticsHelper/events', () => ({
  OPEN_AI_EVENTS: {
    TEST_EVENT: 'open_ai_test_event',
  },
}));

describe('useAI', () => {
  const mockStore = {
    dispatch: vi.fn(),
  };

  const mockGetters = {
    'integrations/getUIFlags': { value: { isFetching: false } },
    'integrations/getAppIntegrations': { value: [] },
    getSelectedChat: { value: { id: '123' } },
    'draftMessages/getReplyEditorMode': { value: 'reply' },
    'draftMessages/get': { value: () => 'Draft message' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useStore.mockReturnValue(mockStore);
    useStoreGetters.mockReturnValue(mockGetters);
    useTrack.mockReturnValue(vi.fn());
    useI18n.mockReturnValue({ t: vi.fn() });
    useAlert.mockReturnValue(vi.fn());
  });

  it('initializes computed properties correctly', async () => {
    const { uiFlags, appIntegrations, currentChat, replyMode, draftMessage } =
      useAI();

    expect(uiFlags.value).toEqual({ isFetching: false });
    expect(appIntegrations.value).toEqual([]);
    expect(currentChat.value).toEqual({ id: '123' });
    expect(replyMode.value).toBe('reply');
    expect(draftMessage.value).toBe('Draft message');
  });

  it('fetches integrations if required', async () => {
    const { fetchIntegrationsIfRequired } = useAI();
    await fetchIntegrationsIfRequired();
    expect(mockStore.dispatch).toHaveBeenCalledWith('integrations/get');
  });

  it('does not fetch integrations if already loaded', async () => {
    mockGetters['integrations/getAppIntegrations'].value = [{ id: 'openai' }];
    const { fetchIntegrationsIfRequired } = useAI();
    await fetchIntegrationsIfRequired();
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('records analytics correctly', async () => {
    const mockTrack = vi.fn();
    useTrack.mockReturnValue(mockTrack);
    const { recordAnalytics } = useAI();

    await recordAnalytics('TEST_EVENT', { data: 'test' });

    expect(mockTrack).toHaveBeenCalledWith('open_ai_test_event', {
      type: 'TEST_EVENT',
      data: 'test',
    });
  });

  it('cleans labels correctly', () => {
    const { cleanLabels } = useAI();
    const result = cleanLabels('Label1, label2, Label1, label3');
    expect(result).toEqual(['label1', 'label2', 'label3']);
  });

  it('fetches label suggestions', async () => {
    OpenAPI.processEvent.mockResolvedValue({
      data: { message: 'label1, label2' },
    });

    const mockStoreGetters = {
      'integrations/getAppIntegrations': {
        value: [{ id: 'openai', hooks: [{ id: 'hook1' }] }],
      },
      getSelectedChat: { value: { id: '123' } },
    };
    useStoreGetters.mockReturnValue(mockStoreGetters);

    const { fetchLabelSuggestions } = useAI();
    const result = await fetchLabelSuggestions();

    expect(OpenAPI.processEvent).toHaveBeenCalledWith({
      type: 'label_suggestion',
      hookId: 'hook1',
      conversationId: '123',
    });

    expect(result).toEqual(['label1', 'label2']);
  });
});
