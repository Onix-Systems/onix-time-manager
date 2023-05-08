import { ref } from "vue";
import { ScheduleInterface } from "@/types/dataInterfaces";
import { DayOfWeek, Month } from "@/constants/DateEnum";

export const UserData = ref({} as ScheduleInterface);

export const editSchedule = (key: string, data: any) => {
  return (UserData.value[key] = data);
};

export const convertStringToDate = (dateInSting: string) => {
  if (dateInSting) {
    const [month, day, year] = dateInSting.split(".");

    const monthIndex: any = Object.values(Month).find((item, index: number) => {
      if (index === Number(month)) {
        return index;
      }
    });
    const date = new Date(`${monthIndex}/${day}/${year}`);

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    };
  } else {
    return "";
  }
};
export const convertDateToString = (date: string) => {
  if (date) {
    const inputDate = new Date(date);
    const daysOfWeek = Object.values(DayOfWeek);
    const dayOfWeek = daysOfWeek[(inputDate.getDay() + 6) % 7];
    const dayOfMonth = inputDate.getDate();
    const months = Object.values(Month);
    const monthAbbreviation = months[inputDate.getMonth()];
    return `${dayOfWeek} ${dayOfMonth} ${monthAbbreviation}`;
  }
};
