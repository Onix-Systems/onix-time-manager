import { PermissionList } from "@/constants/PermissionList";
import { ObjectInterface } from "@/types/dataInterfaces";

export interface PermissionInterface {
  permission: PermissionList;
  whitelist: {
    schedule: ObjectInterface;
    list: ObjectInterface;
  };
  blacklist: {
    schedule: ObjectInterface;
    list: ObjectInterface;
  };
  [key: string]: any;
}

export interface ScheduleTimeObject {
  time: number;
  period: string;
  [key: string]: any;
}

export interface ScheduleTimeLimitsObject {
  timeLimits: number;
  period: string;
  [key: string]: any;
}
