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
      .content--buttons
        button.content--button.primary(@click="close") Cancel
        button.content--button.raised(@click="submit") Set
</template>
<script setup lang="ts">
import { defineEmits, onMounted, defineProps, ref, computed } from "vue";
import MainModal from "@/modals/MainModal.vue";

const emit = defineEmits(["onClosed"]);
const props = defineProps({
  initialData: {
    default: {
      domain: "",
      hours: "",
      minutes: "",
      seconds: "",
    },
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
          if (!isEdit.value) {
            Object.assign(data.list, {
              [copyGroup.domain]: copyGroup,
            });
            chrome.storage.local.set({ limits: data }).then(() => {
              close();
            });
          } else {
            data.list[props.editIndex] = copyGroup;
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
};

onMounted(() => {
  urlGroup.value = { ...props.initialData };
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
