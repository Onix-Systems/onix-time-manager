<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      template(v-if="!isDelete")
        .content--header
          .title Set a limit the site
          button.close(@click="close")
        .content--inputs
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
              type="number",
              min="0",
              max="24",
              v-model.number="urlGroup.hours",
              :class="{ error: !errors.errorTime }",
              placeholder="Hours"
            )
            input.content--input.content--input-dis(
              type="number",
              min="0",
              max="60",
              v-model.number="urlGroup.minutes",
              :class="{ error: !errors.errorTime }",
              placeholder="Minutes"
            )
            input.content--input(
              type="number",
              min="0",
              max="60",
              v-model.number="urlGroup.seconds",
              :class="{ error: !errors.errorTime }",
              placeholder="Seconds"
            )
      template(v-else)
        .content--header
          .title
          button.close(@click="close")
        .content--inputs.delete
          h3.title Are you sure you want to delete this time limit?
          p.subtitle After deleting you will not be able to use this limit to block the site again.
      .content--buttons
        button.content--button.cancel(@click="close") Cancel
        button.content--button.submit(@click="submit") {{ !isDelete ? "Set" : "Delete" }}
</template>
<script setup lang="ts">
import { defineEmits, onMounted, defineProps, ref } from "vue";
import MainModal from "@/modals/MainModal.vue";

const emit = defineEmits(["close", "edit"]);
const props = defineProps({
  initialData: {
    default: {
      domain: "",
      hours: "",
      minutes: "",
      seconds: "",
    },
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  editDomain: {
    type: String,
    default: "",
  },
});
const close = () => {
  emit("close");
};

const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

const errors = ref({
  domain: true,
  domainSame: true,
  errorTime: true,
});

const urlGroup = ref({
  domain: "",
  hours: "",
  minutes: "",
  seconds: "",
});

const submit = () => {
  errors.value.domain = isValidUrl(urlGroup.value.domain);
  const copyGroup = { ...urlGroup.value };
  if (!props.isDelete) {
    if (
      urlGroup.value.hours ||
      urlGroup.value.minutes ||
      urlGroup.value.seconds
    ) {
      errors.value.errorTime = true;
      if (errors.value.domain) {
        chrome.storage.local.get("limits").then((res) => {
          if (
            props.initialData.hours !== urlGroup.value.hours &&
            props.initialData.minutes !== urlGroup.value.minutes &&
            props.initialData.seconds !== urlGroup.value.seconds
          ) {
            errors.value.errorTime = true;
            if (res.limits.list && Object.keys(res.limits.list).length) {
              errors.value.domainSame = !Object.values(res.limits.list).find(
                (item: any) => {
                  return (
                    item.domain ===
                    `https://${new URL(urlGroup.value.domain).hostname}/`
                  );
                }
              );
            }
          } else {
            errors.value.errorTime = false;
          }
          if (errors.value.domainSame) {
            let data = res.limits;
            copyGroup.domain = `https://${
              new URL(urlGroup.value.domain).hostname
            }/`;
            if (!props.isEdit) {
              Object.assign(data.list, {
                [copyGroup.domain]: copyGroup,
              });
              chrome.storage.local.set({ limits: data }).then(() => {
                close();
              });
            } else {
              data.list[props.editDomain] = copyGroup;
              chrome.storage.local.set({ limits: data }).then(() => {
                close();
              });
            }
          }
        });
      }
    } else {
      errors.value.errorTime = false;
    }
  } else {
    chrome.storage.local.get("limits").then((res) => {
      let data = { ...res.limits };
      delete data.list[props.editDomain];
      chrome.storage.local.set({ limits: data }).then(() => {
        close();
      });
    });
  }
};

onMounted(() => {
  urlGroup.value = { ...props.initialData };
});
</script>

<style scoped lang="scss">
html {
  overflow: hidden;
}
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

  &--header {
    display: flex;
    justify-content: space-between;

    margin-bottom: 26px;

    .title {
      font-style: normal;
      font-weight: 500;
      font-size: 22px;
      line-height: 27px;
      color: #7e7e7e;
    }
    .close {
      display: block;

      width: 30px;
      height: 30px;
      padding: 0;
      margin: 0;

      background-image: url("@/assets/icons/cross.svg");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      background-color: transparent;
      border: none;
    }
  }
  &--inputs {
    display: flex;
    flex-direction: column;
    width: 100%;

    margin-bottom: 8px;

    .content--input {
      box-sizing: border-box;
      width: 100%;
      height: 40px;

      padding: 12px 16px;

      border: 1px solid #a9a9a9;
      border-radius: 6px;

      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 15px;
      color: #545d64;

      &::placeholder {
        color: #d9d9d9;
      }
      &.error {
        border: 1px solid #e53935;
      }
    }
    &.delete {
      justify-content: center;
      align-items: center;
      gap: 8px;

      margin-bottom: 48px;

      .title {
        font-style: normal;
        font-weight: 500;
        font-size: 22px;
        line-height: 27px;
        text-align: center;
        color: var(--txt-main-darkblue);
      }
      .subtitle {
        max-width: 401px;

        white-space: break-spaces;
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        color: var(--txt-dark-grey);
      }
    }
  }
  &--error {
    display: flex;

    visibility: hidden;

    height: 18px;
    width: 100%;

    &.show {
      visibility: visible;
    }
    p {
      margin: 5px 0 0 0;
      font-style: normal;
      font-weight: 500;
      font-size: 10px;
      line-height: 10px;
      color: #e53935;
    }
  }
  &--buttons {
    display: flex;
    justify-content: space-between;

    gap: 26px;
    width: 100%;

    .content--button {
      box-sizing: border-box;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      height: 48px;
      width: 100%;
      padding: 15px;

      border: none;
      border-radius: 6px;
      background-color: #000000;

      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
      color: #ffffff;

      &.cancel {
        color: var(--txt-dark-blue);
        background: inherit;
        border: 1px solid var(--txt-dark-blue);
      }
      &.submit {
        color: var(--white);
        background: var(--txt-dark-blue);
      }
    }
  }
}
</style>
