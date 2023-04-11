<template lang="pug">
.parent-control
  .container
    .parent-control__block(v-if="!showSuccess || isEnterPassword")
      h2(v-if="!isSettings && !isEnterPassword") Parent control
      h2(v-if="isSettings") Set password
      h2(v-if="isEnterPassword") Enter password
      .block-inputs
        input(
          v-model="input1",
          maxlength="1",
          ref="input1Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input1)) || errorPassword }"
        )
        input(
          v-model="input2",
          maxlength="1",
          ref="input2Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input2)) || errorPassword }"
        )
        input#input3(
          v-model="input3",
          maxlength="1",
          ref="input3Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input3)) || errorPassword }"
        )
        input(
          v-model="input4",
          maxlength="1",
          ref="input4Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input4)) || errorPassword }"
        )
        input(
          v-model="input5",
          maxlength="1",
          ref="input5Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input5)) || errorPassword }"
        )
        input(
          v-model="input6",
          maxlength="1",
          ref="input6Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input6)) || errorPassword }"
        )
        .error-message(v-if="showErrorMessage") Invalid password
      button(type="button", @click="validateInputs") Submit
    .parent-control__success(
      v-else-if="showSuccess && !isSettings && !isEnterPassword"
    )
      .parent-control
        .parent-control__block
          h2 Refresh this page
          p Click the button below for changes to<br> take effect
          button(type="button", @click="refreshPage") Refresh
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from "vue";
import { settingsData } from "@/composables/settingsComp";

const props = defineProps({
  isSettings: { type: Boolean, default: false },
  isEnterPassword: { type: Boolean, default: false },
});
const emit = defineEmits(["setPassword"]);

const input1 = ref("");
const input2 = ref("");
const input3 = ref("");
const input4 = ref("");
const input5 = ref("");
const input6 = ref("");
const showSuccess = ref(false);
const showErrorMessage = ref(false);
const isInvalid = (input: string) => {
  return input === "" || !/^\d+$/.test(input);
};

const inputs = computed(() => {
  return [
    input1.value,
    input2.value,
    input3.value,
    input4.value,
    input5.value,
    input6.value,
  ].join("");
});

const errorPassword = ref(false);

function validateInputs() {
  showErrorMessage.value = true;
  const errorMessage = document.querySelector(".error-message");
  if (
    isInvalid(input1.value) ||
    isInvalid(input2.value) ||
    isInvalid(input3.value) ||
    isInvalid(input4.value) ||
    isInvalid(input5.value) ||
    isInvalid(input6.value)
  ) {
    if (errorMessage) {
      errorMessage.textContent = "Invalid password";
    }
    return false;
  }
  if (props.isEnterPassword && settingsData.value.code !== inputs.value) {
    if (errorMessage) {
      errorMessage.textContent = "Invalid password";
    }
    errorPassword.value = true;
    return false;
  }
  if (errorMessage) {
    errorMessage.textContent = "";
  }
  showSuccess.value = true;
  errorPassword.value = false;
  emit("setPassword", inputs.value);
}

function handleInput(event: { target: any }) {
  const input = event.target;
  const maxLength = parseInt(input.getAttribute("maxlength"));
  let inputValue = input.value;
  if (inputValue.length > maxLength) {
    inputValue = inputValue.slice(0, maxLength);
    input.value = inputValue;
  }
  const nextInput = input.nextElementSibling;
  if (nextInput) {
    nextInput.focus();
  }
}

function refreshPage() {
  location.reload();
}
</script>

<style lang="scss">
.parent-control {
  background: #f7f7f7;
  padding: 16px 0;
  .error-message {
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    color: #ea394b;
    position: absolute;
    top: 46px;
    width: 300px;
  }
  &__block {
    padding: 24px 0;
    width: 385px;
    height: auto;
    background: #ffffff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
    h2 {
      font-family: Inter, sans-serif;
      font-style: normal;
      font-weight: 700;
      font-size: 18px;
      line-height: 22px;
      color: #000000;
      text-align: center;
    }
    p {
      font-family: Inter, sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 17px;
      text-align: center;
      text-align: center;
      color: #585858;
      margin: 16px auto 28px;
    }
    button {
      width: 253px;
      height: 33px;
      background: #e6e6e6;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      font-family: Inter, sans-serif;
      font-style: normal;
      font-weight: 700;
      font-size: 14px;
      line-height: 17px;
      color: #585858;
      display: block;
      margin: 0 auto;
      cursor: pointer;
      &:hover {
        background: #eff9fe;
        border: 1px solid #4196db;
        color: #4297db;
      }
    }
    .block-inputs {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 16px 66px 36px;
      position: relative;
      label {
        color: #585858;
        width: 8px;
        margin: 0 9px;
      }
      input {
        text-align: center;
        width: 28px;
        height: 35px;
        margin-right: 6px;
        background: #eff9fe;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        font-family: Inter, sans-serif;
        font-style: normal;
        font-weight: 700;
        font-size: 14px;
        line-height: 17px;
        color: #000000;
      }
      #input3::before {
        display: inline-block;
        content: "";
        width: 8px;
        height: 8px;
        margin-left: 9px;
        background: url("@/assets/minus.svg") no-repeat;
      }
      input.invalid {
        border-color: #ea394b;
      }
      width: 34px;
      height: 39px;

      background: #eff9fe;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
    }
  }
}
</style>
