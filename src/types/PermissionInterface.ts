import { PermissionList } from "@/constants/PermissionList";

export interface PermissionInterface {
  type: PermissionList;
  list: PermissionItemInterface;
}

export interface PermissionItemInterface {
  whitelist: {
    [key: string]: string;
  };
  blacklist: {
    [key: string]: string;
  };
}
