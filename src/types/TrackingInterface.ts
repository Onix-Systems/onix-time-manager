export interface ActivityInterface {
  begin: number;
  end?: number;
}

export interface SessionInterface {
  activity: ActivityInterface[];
  id: string;
  path: string;
}
