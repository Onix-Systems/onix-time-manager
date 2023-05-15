<template lang="pug">
.container
  .history
    .option--header
      .option--header-left
        .option--header--title {{ MenuItemsEnum.History }}
      .option--header-right
        .history--sorting
          dropdown-component(:disable="true")
            template(v-slot:selectedItem="")
              .item-selected {{ sortByText }}:
            template(v-slot:content="props")
              li(@click="sortByTime(props)") By date
              li(@click="sortByLastVisit(props)") By total time
              li(@click="sortByVisits(props)") By session
    table.history-page--table
      thead
        tr.history-page--title
          th
          th Web address
          th.col-width Sessions
          th.col-width Last visit
          th.col-width Total time
      template(v-if="sortedItems.length")
        tbody(
          v-for="(item, index) in sortedItems",
          :key="`History_key__${index}`",
          :id="`${index}`"
        )
          tr
            td.font-14
              input.checkbox.global(
                type="checkbox",
                :id="`${index}`",
                :value="index",
                v-model="selectedItems",
                :checked="isChecked(item)",
                @change="select(index)"
              )
            td
              .icon(:style="{ backgroundImage: `url(${item.icon})` }")
              p {{ `https://${item.domain}/` }}
            td.arrow.font-14(
              :class="{ active: activeRow === index }",
              :style="{ cursor: 'pointer' }",
              @click="toggleRow(index)"
            ) {{ item.visited }}
            td.font-14 {{ item.lastVisit }}
            td.font-14 {{ formatTime(item.timeSpent) }}
          tr(
            v-for="(key, subIndex) in Object.keys(item.urls)",
            :id="`row-${index}-col-${subIndex}`",
            v-show="activeRow === index"
          )
            td
            td
              input.sub(
                type="checkbox",
                :id="`${index}-${subIndex}`",
                :value="`${index}-${subIndex}`",
                v-model="selectedItems",
                :checked="isChecked(item.urls[key])",
                @change="subSelect(index)"
              )
              span {{ `https://${item.domain}` }}{{ key }}
            td
            td.child {{ item.urls[key].firstVisit }}
            td.child {{ formatTime(item.urls[key].timeSpent) }}
          .modal(v-if="Object.keys(selectedItems).length > 0")
            .modal--content
              .modal--content-cancel
                button.cancel(@click="cancel()")
                p Selected {{ Object.keys(selectedItems).length }}
              button.delete(@click="openModal(EnumModalKeys.History)") Delete
  .history--delete(v-if="sortedItems.length")
    .history--delete-button
      h3 Delete Website History
      p Reset and delete all of your website history
    button(@click="clearStorage") Delete Data
  .history--no-data(v-else)
    p The history is empty. This list will be filled out after you first visit the website.
    .icon--data-empty
  delete-modal(
    v-if="isOpen(EnumModalKeys.History)",
    :delete-type="`history page`",
    :delete-context="`You won't be able to view this story again after deleting it.`",
    @onSubmit="deleteItem",
    @onClosed="closeModal(EnumModalKeys.History)"
  )
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  checkDataInStorage,
  filteringData,
  getHistory,
  historyStorage,
  selectNavItem,
} from "@/composables/common/trackerPageActions";
import moment from "moment";
import { closeModal, isOpen, openModal } from "@/composables/modalActions";
import { EnumModalKeys } from "@/constants/EnumModalKeys";
import DeleteModal from "@/modals/common/DeleteModal.vue";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import DropdownComponent from "@/components/common/DropdownComponent.vue";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";

onMounted(() => {
  selectNavItem(PopupTrackerNavItemsEnum.total);
});
const activeRow = ref(null);

const formatTime = (timeInSeconds: number) => {
  let hours = Math.floor(timeInSeconds / 3600);
  let minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
  let seconds = timeInSeconds - hours * 3600 - minutes * 60;

  let hoursString = hours.toString().padStart(2, "0");
  let minutesString = minutes.toString().padStart(2, "0");
  let secondsString = seconds.toString().padStart(2, "0");
  return `${hoursString}h ${minutesString}m ${secondsString}s`;
};

const select = (index: number) => {
  Object.keys(sortedItems.value[index].urls).forEach((elem, numb) => {
    if (selectedItems.value.includes(index)) {
      selectedItems.value.push(`${index}-${numb}`);
    } else {
      const indexOf = selectedItems.value.indexOf(`${index}-${numb}`);
      selectedItems.value.splice(indexOf, 1);
    }
  });
};

const subSelect = (index: number) => {
  const keys = Object.keys(sortedItems.value[index].urls);
  if (
    keys.reduce((acum, elem, numb) => {
      return acum + (selectedItems.value.includes(`${index}-${numb}`) ? 1 : 0);
    }, 0) === keys.length
  ) {
    selectedItems.value.push(index);
  } else {
    if (selectedItems.value.includes(index)) {
      const indexOf = selectedItems.value.indexOf(index);
      selectedItems.value.splice(indexOf, 1);
    }
  }
};

const showDelete = ref(false);
const selectedItems = ref<(number | string)[]>([]);
const showModal = ref(false);
const sortByText = ref("Sort by date");

const isChecked = (item: number) => {
  let result = selectedItems.value.includes(item);
  return result;
};

const toggleRow = (index: any) => {
  if (activeRow.value === index) {
    activeRow.value = null;
  } else {
    activeRow.value = index;
  }
};
const cancel = () => {
  selectedItems.value = [];
  showModal.value = false;
};
const clearStorage = () => {
  chrome.storage.local.remove(["pages"], () => {
    location.reload();
  });
  showDelete.value = false;
};

let sortOrder = ref("time-descending");
let sortedItems = computed(() => {
  return sorting(filteringData);
});

enum Order {
  time = "time",
  visited = "visited",
  timeSpent = "timeSpent",
}
const sorting = (filteringData: any) => {
  switch (sortOrder.value) {
    case Order.time: {
      return filteringData.value.sort((a: any, b: any) =>
        moment(b.firstOpen).diff(a.firstOpen)
      );
    }
    case Order.visited: {
      return filteringData.value.sort(
        (a: any, b: any) => b.visited - a.visited
      );
    }
    case Order.timeSpent: {
      return filteringData.value.sort(
        (a: any, b: any) => b.timeSpent - a.timeSpent
      );
    }
    default: {
      return filteringData.value;
    }
  }
};

const sortByVisits = (props: any) => {
  sortOrder.value = Order.visited;
  sortByText.value = "Sort by session";
  props.toggleVisibility();
};
const sortByLastVisit = (props: any) => {
  sortOrder.value = Order.time;
  sortByText.value = "Sort by total time";
  props.toggleVisibility();
};
const sortByTime = (props: any) => {
  sortOrder.value = Order.timeSpent;
  sortByText.value = "Sort by date";
  props.toggleVisibility();
};

const deleteItem = () => {
  getHistory();
  const history = { ...historyStorage.value };
  if (selectedItems.value) {
    const domainKeys = selectedItems.value.filter((item) => {
      return typeof item === "number";
    });
    selectedItems.value.forEach((item: any) => {
      if (domainKeys.includes(item)) {
        const site: any = sortedItems.value[item];
        if (site) {
          Object.values(site.urls).forEach((elem: any) => {
            elem.visited.forEach((data: any) => {
              const [day, month, year] = data.split(".");
              const selectData = {
                year,
                month,
                day,
              };
              if (checkDataInStorage(selectData)) {
                delete history[selectData.year][Number(selectData.month)][
                  Number(selectData.day)
                ][site.domain];
              }
            });
          });
        }
      } else {
        const [key, subKey] = item.split("-");
        if (!domainKeys.includes(Number(key))) {
          const site: any = sortedItems.value[key];
          const siteKey = Object.keys(site.urls)[subKey];
          const siteUrl: any = site.urls[siteKey];
          if (siteUrl) {
            siteUrl.visited.forEach((data: any) => {
              const [day, month, year] = data.split(".");
              const selectData = {
                year,
                month,
                day,
              };
              if (checkDataInStorage(selectData)) {
                delete history[selectData.year][Number(selectData.month)][
                  Number(selectData.day)
                ][site.domain]["urls"][siteKey];
              }
            });
          }
        }
      }
    });
  }
  chrome.storage.local.set({ pages: history }, () => {
    getHistory();
    selectedItems.value = [];
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 116px;
  .modal {
    &--content {
      z-index: 2;
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 24px 24px 24px 246px;
      background: #fdfdfd;
      border-bottom: 1px solid #d9d9d9;

      &-cancel {
        display: flex;
        align-items: center;
      }
      p {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 17px;
        color: var(--txt-light-grey);
      }
      button.cancel {
        padding: 0;
        margin-right: 26px;
        width: 23px;
        height: 24px;
        background: none;
      }
      button.cancel::before {
        display: inline-block;
        content: "";
        background-image: url("@/assets/remove.svg");
        width: 24px;
        height: 24px;
        min-width: 24px;
        min-height: 24px;
        margin-right: 19px;
      }
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 32px;
        background: var(--bttn-delete-lightblue);
        color: var(--txt-dark-grey);
        border-radius: 6px;
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 19px;
        border: none;
      }
    }
  }
  .global {
    margin-right: 9px;
  }
  .sub {
    margin-left: 10px !important;
    margin-right: 0 !important;
  }
  .history {
    margin-top: 3px;
    .history--sorting {
      height: 40px;
      &::v-deep(.drop-down) {
        height: 40px;
        background: inherit;
        .selected-item {
          padding: 0 25px 0 10px;
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 19px;
          color: var(--txt-dark-grey);
          border: 1px solid var(--backgr-card-lightgrey);
          border-radius: 4px;
          &--arrow {
            right: 15px;
            background: var(--txt-dark-grey);
          }
          &.active {
            border-bottom: 1px solid var(--white);
            border-radius: 4px 4px 0 0;
          }
        }
        .drop-down {
          &--content {
            box-sizing: border-box;
            top: 40px;
            background: var(--white);
            border: 1px solid var(--backgr-card-lightgrey);
            border-top: 0;
            border-radius: 0 0 4px 4px;
          }
          &--list {
            overflow: inherit;
            background: var(--white);
            li {
              cursor: pointer;
              display: flex;
              align-items: center;
              height: 40px;
              font-style: normal;
              font-weight: 400;
              font-size: 14px;
              line-height: 19px;
              color: var(--txt-dark-grey);
              border-top: 1px solid var(--backgr-card-lightgrey);
              padding-left: 10px;
            }
          }
        }
      }
    }
    &--no-data {
      display: block;
      p {
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 22px;
        text-align: center;
        color: var(--txt-light-grey);
        margin: 70px auto 30px;
        width: 486px;
      }
      .icon--data-empty {
        height: 170px;
        width: 206px;
        margin: 0 auto;
        background: url("@/assets/frame-no-dataL.svg") no-repeat center;
        background-size: cover;
      }
    }
    &--delete {
      z-index: 2;
      display: flex;
      justify-content: space-between;
      position: fixed;
      bottom: 0;
      padding: 34px 0;
      width: calc(100% - 270px);
      background: var(--white);
      h3 {
        font-style: normal;
        font-weight: 500;
        font-size: 18px;
        line-height: 25px;
        margin-bottom: 4px;
      }
      p {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 19px;
        color: var(--txt-light-grey);
      }
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        width: 169px;
        background: var(--bttn-delete-lightblue);
        border-radius: 6px;
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 19px;
        color: var(--txt-dark-grey);
        border: none;
      }
    }
    &-page {
      &--title {
        border-bottom: 1px solid #f1f1f1;
        th {
          font-style: normal;
          font-weight: 500;
          font-size: 12px;
          line-height: 16px;
          color: var(--txt-light-grey);
          text-align: right;
          &:nth-child(2) {
            text-align: left;
          }
          &.col-width {
            width: 130px;
            min-width: 130px;
          }
        }
      }
      &--table {
        width: 100%;
        height: auto;
        margin-top: 45px;
        th:first-child {
          width: 38px;
        }
        th {
          padding-bottom: 10px;
        }
        td {
          padding: 24px 0;
          font-style: normal;
          font-weight: 600;
          font-size: 16px;
          line-height: 22px;
          color: #000000;
          text-align: right;
          margin-right: 10px;
          &.font-14 {
            vertical-align: middle;
            font-style: normal;
            font-weight: 500;
            font-size: 14px;
            line-height: 19px;
          }
          &:nth-child(2) {
            text-align: left;
            display: flex;
            align-items: center;
          }
          .checkbox {
            margin-right: 10px;
          }

          .icon {
            width: 40px;
            height: 40px;
            margin-right: 16px;
            background-size: contain;
            background-repeat: no-repeat;
          }

          span {
            font-style: normal;
            font-weight: 500;
            font-size: 12px;
            line-height: 16px;
            color: #757575;
            margin-left: 10px;
          }
        }
        td.child {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 15px;
          color: #757575;
        }
        input[type="checkbox"] {
          position: relative;
          border: 1px solid #757575;
          border-radius: 4px;
          background: none;
          cursor: pointer;
          line-height: 0;
          margin: 0 21px 0 0;
          outline: 0;
          padding: 0 !important;
          vertical-align: text-top;
          height: 20px;
          width: 20px;
          min-width: 20px;
          min-height: 20px;
          -webkit-appearance: none;
          background: var(--white);
        }

        input[type="checkbox"]:checked {
          background-color: var(--bttn-active-lightblue);
          border: 1px solid var(--bttn-active-lightblue);
          opacity: 1;
          &:before {
            display: block;
            content: "";
            position: absolute;
            right: 50%;
            top: 50%;
            width: 4px;
            height: 10px;
            border: solid var(--txt-light-grey);
            border-width: 0 2px 2px 0;
            margin: -1px -1px 0 -1px;
            transform: rotate(45deg) translate(-50%, -50%);
            z-index: 2;
          }
        }
        td.arrow {
          &::before {
            cursor: pointer;
            display: inline-block;
            content: "";
            background-image: url("@/assets/vector1.svg");
            width: 12px;
            height: 6px;
            margin-bottom: 2px;
            margin-right: 18px;
          }
          &.active {
            &::before {
              transform: rotate(180deg);
              transition: all 0.3s;
            }
          }
        }
        h4 {
          cursor: pointer;
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 17px;
          color: #000000;
          padding: 16px;
        }
        h4::after {
          display: inline-block;
          content: "";
          background-image: url("@/assets/Vector.svg");
          width: 9px;
          height: 5px;
          margin: 0 0 2px 8px;
        }
      }
    }
  }
}
</style>
