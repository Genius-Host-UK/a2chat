import { frontendURL } from '../../helper/URLHelper';

const reports = accountId => ({
  routes: [
    'settings_account_reports',
    'csat_reports',
    'agent_reports',
    'label_reports',
    'inbox_reports',
    'team_reports',
  ],
  menuItems: {
    back: {
      icon: 'chevron-left',
      label: 'HOME',
      hasSubMenu: false,
      toStateName: 'home',
      toState: frontendURL(`accounts/${accountId}/dashboard`),
    },
    reportOverview: {
      icon: 'arrow-trending-lines',
      label: 'REPORTS_OVERVIEW',
      hasSubMenu: false,
      toState: frontendURL(`accounts/${accountId}/reports/overview`),
      toStateName: 'settings_account_reports',
    },
    csatReports: {
      icon: 'emoji',
      label: 'CSAT',
      hasSubMenu: false,
      toState: frontendURL(`accounts/${accountId}/reports/csat`),
      toStateName: 'csat_reports',
    },
    agentReports: {
      icon: 'ion-person-stalker',
      label: 'REPORTS_AGENT',
      hasSubMenu: false,
      toState: frontendURL(`accounts/${accountId}/reports/agent`),
      toStateName: 'agent_reports',
    },
    labelReports: {
      icon: 'ion-pricetags',
      label: 'REPORTS_LABEL',
      hasSubMenu: false,
      toState: frontendURL(`accounts/${accountId}/reports/label`),
      toStateName: 'label_reports',
    },
    inboxReports: {
      icon: 'ion-archive',
      label: 'REPORTS_INBOX',
      hasSubMenu: false,
      toState: frontendURL(`accounts/${accountId}/reports/inboxes`),
      toStateName: 'inbox_reports',
    },
    teamReports: {
      icon: 'ion-ios-people',
      label: 'REPORTS_TEAM',
      hasSubMenu: false,
      toState: frontendURL(`accounts/${accountId}/reports/teams`),
      toStateName: 'team_reports',
    },
  },
});

export default reports;
