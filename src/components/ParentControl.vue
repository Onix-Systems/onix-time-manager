<template lang="pug">
.parent-control
  .container
    .parent-control__block(v-if="!showSuccess || isEnterPassword")
      h2(v-if="!isSettings && !isEnterPassword") Parent control
      h2(v-if="isSettings") Create password
      h2(v-if="isEnterPassword") Enter password
      button.close(v-if="isSettings", @click="showSetPassword = false")
      .block-inputs
        input(
          :type="isSettings ? 'text' : 'password'",
          v-model="input1",
          maxlength="1",
          ref="input1Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input1)) || errorPassword, value: input1 }"
        )
        input(
          :type="isSettings ? 'text' : 'password'",
          v-model="input2",
          maxlength="1",
          ref="input2Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input2)) || errorPassword, value: input2 }"
        )
        input#input3(
          :type="isSettings ? 'text' : 'password'",
          v-model="input3",
          maxlength="1",
          ref="input3Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input3)) || errorPassword, value: input3 }"
        )
        input(
          :type="isSettings ? 'text' : 'password'",
          v-model="input4",
          maxlength="1",
          ref="input4Ref",
          @input="handleInput",
          :class="{ invalid: (showErrorMessage && isInvalid(input4)) || errorPassword, value: input4 }"
        )
      .error-message(:class="{ hidden: !showErrorMessage }") Invalid password
      button.submit(
        type="button",
        @click="validateInputs",
        :class="{ value: input4 }"
      ) Add
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
import {
  settingsData,
  editShowSetPassword,
  showSetPassword,
} from "@/composables/settingsComp";

const props = defineProps({
  isSettings: { type: Boolean, default: false },
  isEnterPassword: { type: Boolean, default: false },
});
const emit = defineEmits(["setPassword"]);

const input1 = ref("");
const input2 = ref("");
const input3 = ref("");
const input4 = ref("");
const showSuccess = ref(false);
const showErrorMessage = ref(false);
const isInvalid = (input: string) => {
  return input === "" || !/^\d+$/.test(input);
};

const inputs = computed(() => {
  return [input1.value, input2.value, input3.value, input4.value].join("");
});

const errorPassword = ref(false);

function validateInputs() {
  showErrorMessage.value = true;
  const errorMessage = document.querySelector(".error-message");
  if (
    isInvalid(input1.value) ||
    isInvalid(input2.value) ||
    isInvalid(input3.value) ||
    isInvalid(input4.value)
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

function handleInput(event: { target: any; inputType: string }) {
  const input = event.target;
  const maxLength = parseInt(input.getAttribute("maxlength"));
  let inputValue = input.value;
  if (inputValue.length > maxLength) {
    inputValue = inputValue.slice(0, maxLength);
    input.value = inputValue;
  }
  let nextInput;
  if (event.inputType === "deleteContentBackward") {
    nextInput = input.previousElementSibling;
  } else {
    nextInput = input.nextElementSibling;
    if (nextInput) {
      nextInput.value = "";
    }
  }
  if (nextInput) {
    nextInput.focus();
  }
}

function refreshPage() {
  location.reload();
}
</script>

<style scoped lang="scss">
.parent-control {
  position: relative;
  background: #f7f7f7;
  padding: 16px 0;
  .container {
    height: auto;
  }
  .error-message {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 34px;
    color: var(--error);
    width: 278px;
    margin: 0 auto;

    &.hidden {
      pointer-events: none;
      user-select: none;
      opacity: 0;
    }
  }
  &__block {
    position: relative;
    padding: 24px 0;
    width: 332px;
    height: auto;
    background: var(--white);
    border-radius: 6px;
    .close {
      position: absolute;
      display: block;

      width: 30px;
      height: 30px;
      padding: 0;
      margin: 0;
      top: 6px;
      right: 7px;

      background-image: url("@/assets/icons/cross.svg");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      background-color: transparent;
      border: none;
    }
    h2 {
      font-style: normal;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
      text-align: center;
    }
    p {
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 17px;
      text-align: center;
      color: #585858;
      margin: 16px auto 28px;
    }
    .submit {
      display: block;
      box-sizing: border-box;
      cursor: pointer;

      width: 278px;
      height: 48px;
      margin: 0 auto;
      padding: 10px 16px;

      background: var(--bttn-submit-lightpurple);
      border-radius: 6px;

      font-style: normal;
      font-weight: 600;
      font-size: 15px;
      line-height: 18px;
      text-align: center;
      color: var(--txt-anti-flashlight);
      &.value {
        background: var(--txt-dark-blue);
      }
    }
    .block-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 28px 0 0;
      position: relative;
      height: 39px;
      border-radius: 4px;
      label {
        color: #585858;
        width: 8px;
        margin: 0 9px;
      }
      input {
        box-sizing: border-box;
        text-align: center;
        width: 40px;
        height: 40px;
        margin-right: 16px;

        background: var(--bttn-active-lightblue);
        border-radius: 6px;
        border: none;

        font-style: normal;
        font-weight: 700;
        font-size: 14px;
        line-height: 17px;
        color: var(--txt-dark-blue);
        &.value {
          border: 1px solid var(--txt-dark-blue);
        }
        &:last-child {
          margin: 0;
        }
        &[type="password"] {
          font: small-caption;
          font-size: 40px;
        }
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
        border: 1px solid var(--error);
      }
    }
  }
}
</style>
