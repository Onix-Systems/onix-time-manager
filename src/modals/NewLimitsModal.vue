<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      .content--header
        .title Set a limit the site
        button.close(@click="close")
      .content--body
        input.content--input(
          type="text",
          placeholder="Enter the website address",
          @input="errors.domain = true",
          :class="{ error: !errors.domain || !errors.domainSame }",
          v-model="urlGroup.domain"
        )
        .content--error(
          :class="{ show: !errors.domain || !errors.domainSame }"
        )
          p {{ !errors.domain ? "Please check validity of initial url" : "You already have this url in the list" }}
        .content--block
          input.content--input(
            @click="selectHours",
            type="number",
            min="0",
            max="24",
            v-model.number="urlGroup.hours",
            :class="{ error: !errors.errorTime }",
            placeholder="Hours",
            @keypress="parseInput($event)",
            @input="parseInput($event)",
            @blur="parseInput($event)"
          )
          input.content--input.content--input-dis(
            @click="selectMinutes",
            type="number",
            min="0",
            max="60",
            v-model.number="urlGroup.minutes",
            :class="{ error: !errors.errorTime }",
            placeholder="Minutes",
            @keypress="parseInput($event)",
            @input="parseInput($event)",
            @blur="parseInput($event)"
          )
          input.content--input(
            @click="selectSeconds",
            type="number",
            min="0",
            max="60",
            v-model.number="urlGroup.seconds",
            :class="{ error: !errors.errorTime }",
            placeholder="Seconds",
            @keypress="parseInput($event)",
            @input="parseInput($event)",
            @blur="parseInput($event)"
          )
      .content--buttons
        button.content--button.primary(@click="close") Cancel
        button.content--button.raised(@click="submit") Set
</template>
<script setup lang="ts">
import { defineEmits, onMounted, defineProps, ref, computed } from "vue";
import MainModal from "@/modals/MainModal.vue";
import {
  convertTimeHMS,
  convertToSeconds,
  parseDate,
  validUrlRegex,
} from "@/composables/common/dateComposable";
import { checkForSecure, isValidUrl } from "@/composables/common/common";
import { LimitsInterfaces } from "@/types/LimitsInterfaces";
import { defaultLimits } from "@/composables/limitsComp";

enum TimeTypes {
  hours = "hours",
  minutes = "minutes",
  seconds = "seconds",
}

const emit = defineEmits(["onClosed"]);
const props = defineProps({
  limitsData: {
    type: Object as () => LimitsInterfaces,
    default: defaultLimits,
  },
  initialData: {
    default: {},
  },
  editIndex: {
    type: String,
    default: "",
  },
});
const close = () => {
  emit("onClosed");
};

const isEdit = computed(() => {
  return !!props.editIndex;
});

const errors = ref({
  domain: true,
  domainSame: true,
  errorTime: true,
});
const selected = ref("");
const urlGroup = ref({
  domain: "",
  hours: 0,
  minutes: 0,
  seconds: 0,
  timeSpent: 0,
});

const submit = () => {
  errors.value.domain = isValidUrl(urlGroup.value.domain);
  const copyGroup = { ...urlGroup.value };
  errors.value.errorTime =
    !!urlGroup.value.hours ||
    !!urlGroup.value.minutes ||
    !!urlGroup.value.seconds;
  if (errors.value.domain) {
    chrome.storage.local.get("limits").then((res) => {
      if (
        res.limits.list &&
        Object.keys(res.limits.list).length &&
        !isEdit.value
      ) {
        errors.value.domainSame = !Object.values(res.limits.list).find(
          (item: any) => {
            return (
              item.domain ===
              `https://${
                new URL(checkForSecure(urlGroup.value.domain)).hostname
              }`
            );
          }
        );
      }
      if (errors.value.domainSame && errors.value.errorTime) {
        urlGroup.value.domain = checkForSecure(urlGroup.value.domain);
        let data = props.limitsData;
        if (res && res.limits) {
          data = res.limits;
        }
        copyGroup.domain = `https://${new URL(urlGroup.value.domain).hostname}`;
        const hour = Number(copyGroup.hours);
        const minute = Number(copyGroup.minutes);
        const second = Number(copyGroup.seconds);
        const timeItem = { hour, minute, second };
        const item = {
          domain: copyGroup.domain,
          siteLimit: {
            date: parseDate(new Date().getTime()),
            timeLimit: convertToSeconds(timeItem),
            timeSpent: 0,
          },
        };
        if (!isEdit.value) {
          data.list[copyGroup.domain as any] = item;
          chrome.storage.local.set({ limits: data }).then(() => {
            close();
          });
        } else {
          delete data.list[props.editIndex as any];
          data.list[copyGroup.domain as any] = item;
          chrome.storage.local.set({ limits: data }).then(() => {
            close();
          });
        }
        chrome.storage.local.get("timeSpent").then((res) => {
          const timeSpent = {
            general: 0,
            list: {} as { [key: string]: number },
          };
          if (res.timeSpent) {
            timeSpent.general = res.timeSpent.general;
            timeSpent.list = res.timeSpent.list;
            timeSpent.list[copyGroup.domain] = 0;
            chrome.storage.local.set({ timeSpent });
          }
          chrome.storage.local.set({ timeSpent });
        });
        errors.value.errorTime = false;
      }
    });
  }
};

const initialData = ref();

const parseInput = (evt: Event) => {
  if (selected.value) {
    const timeParser = (value: number) => {
      if (selected.value === TimeTypes.hours) {
        if (value > 24) {
          urlGroup.value.hours = 24;
        } else {
          urlGroup.value.hours = value;
        }
      }
    };

    const reset = () => {
      switch (selected.value) {
        case TimeTypes.hours: {
          urlGroup.value.hours = 0;
          break;
        }
        case TimeTypes.minutes: {
          urlGroup.value.minutes = 0;
          break;
        }
        case TimeTypes.seconds: {
          urlGroup.value.seconds = 0;
          break;
        }
      }
    };

    switch (evt.type) {
      case "blur": {
        const value = (evt.target as EventTarget & { value: string }).value;
        if (!value) {
          reset();
        } else {
          timeParser(+value);
          if (selected.value === TimeTypes.minutes) {
            if (+value > 60) {
              if (+urlGroup.value.hours < 24) {
                urlGroup.value.hours += Math.floor(+value / 60);
              }
              urlGroup.value.minutes = +value % 60;
            } else {
              urlGroup.value.minutes = +value;
            }
          } else if (selected.value === TimeTypes.seconds) {
            if (+value > 3600) {
              if (+urlGroup.value.hours < 24) {
                urlGroup.value.hours += Math.floor(+value / 3600);
              } else {
                urlGroup.value.hours = 24;
              }
              const minutes = +value % 3600;
              if (+urlGroup.value.minutes < 60) {
                urlGroup.value.minutes += Math.floor(+minutes / 60);
              } else {
                urlGroup.value.minutes = 60;
              }
              urlGroup.value.seconds = +minutes % 60;
            } else if (+value > 60) {
              if (+urlGroup.value.minutes < 60) {
                urlGroup.value.minutes += Math.floor(+value / 60);
              }
              urlGroup.value.seconds = +value % 60;
            } else {
              urlGroup.value.seconds = +value;
            }
          }
        }
        break;
      }
      case "input": {
        const value = (evt.target as EventTarget & { value: string }).value;
        if (+value < 0) {
          reset();
        } else {
          timeParser(+value);
          if (selected.value === TimeTypes.minutes) {
            if (+value > 60) {
              urlGroup.value.minutes = 60;
            } else {
              urlGroup.value.minutes = +value;
            }
          } else if (selected.value === TimeTypes.seconds) {
            if (+value > 60) {
              urlGroup.value.seconds = 60;
            } else {
              urlGroup.value.seconds = +value;
            }
          }
        }
        break;
      }
      case "keypress": {
        const selectInput =
          urlGroup.value[
            selected.value as keyof {
              minutes: number;
              hours: number;
              seconds: number;
            }
          ];
        const condition = (input = 0) => {
          const concatenatedValue =
            input + (evt as Event & { key: string }).key.toString();
          const condition = Number(concatenatedValue);
          if (concatenatedValue.match(/^0[0-9]$/) !== null) {
            evt.preventDefault();
          }
          urlGroup.value[
            selected.value as keyof {
              minutes: number;
              hours: number;
              seconds: number;
            }
          ] = condition;
        };
        if (selectInput && selectInput.toString().length < 2) {
          condition(selectInput);
        } else {
          condition();
        }
        break;
      }
    }
  }

  evt.preventDefault();
};

const selectHours = () => {
  selected.value = TimeTypes.hours;
};
const selectMinutes = () => {
  selected.value = TimeTypes.minutes;
};

const selectSeconds = () => {
  selected.value = TimeTypes.seconds;
};

onMounted(() => {
  let initial: any = { ...props.initialData };

  if (!Object.keys(initial).length) {
    initial = {
      domain: "",
      siteLimit: {
        date: "",
        timeLimit: 0,
        timeSpent: 0,
      },
    };
  }

  const time = convertTimeHMS(Number(initial.siteLimit.timeLimit));

  urlGroup.value.domain = initial.domain;
  urlGroup.value.hours = +time.hour;
  urlGroup.value.minutes = +time.minute;
  urlGroup.value.seconds = +time.second;
  urlGroup.value.timeSpent = initial.siteLimit.timeSpent;

  initialData.value = urlGroup.value;
});
</script>

<style scoped lang="scss">
@import "@/scss/common/modal.scss";

.content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  width: 654px;
  &--block {
    display: flex;
    margin-bottom: 24px;
    input.content--input.content--input-dis {
      margin: 0 10px;
    }
  }
}
</style>
