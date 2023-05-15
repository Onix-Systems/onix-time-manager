export interface ObjectInterface {
  [key: string]: any;
}

export interface SiteInterface {
  domain: string;
  visited: number;
  icon: string;
  dayActivity: {
    [key: number]: {
      timeSpent: number;
    };
  };
  timeSpent: number;
  sessions: number[];
  currentSession: number;
  longestSession: number;
  lastVisit: string;
  firstVisit: string;
  mostActive: number;
  mostInactive: number;
  urls: {
    [key: string]: {
      visited?: string[];
      firstVisit: string;
      timeSpent: number;
    };
  };
}

export interface SiteObject {
  [domain: string]: SiteInterface;
}

export interface TooltipItem {
  dataIndex: number;
  raw: number;
}

export interface DateInterface {
  year: number;
  month: number;
  day: number;
}

export interface ScheduleInterface {
  isAllDay: boolean;
  selectOption: string;
  weekly: string[];
  daily: number;
  date: string;
  time?: { from: string; to: string };
  timeLimits?: { hour: number; minute: number };
  [key: string]: any;
}
