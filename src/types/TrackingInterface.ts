export interface ActivityInterface {
  begin: number;
  end?: number;
}

export interface SessionInterface {
  activity: ActivityInterface[];
  id: string;
  tab_id: string;
  path: string;
}

export interface HistoryListInterface {
  domain: string;
  icon: string;
  sessions: SessionInterface[];
}
