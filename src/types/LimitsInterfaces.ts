export interface LimitsInterfaces {
  browserLimit: boolean;
  sitesLimit: boolean;
  browserTime: TimeSpentDataInterface;
  list: LimitSiteInterface[];
  [key: string]: boolean | TimeSpentDataInterface | LimitSiteInterface[];
}

export interface LimitSiteInterface {
  domain: string;
  siteLimit: TimeSpentDataInterface;
  [key: string]: string | TimeSpentDataInterface;
}

export interface TimeSpentDataInterface {
  date: string;
  timeLimit: number;
  timeSpent: number;
  [key: string]: string | number;
}
