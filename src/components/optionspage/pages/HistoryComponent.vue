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
              .item-selected {{ sortOption ? `By ${sortOption}` : "Sort by"}}:
            template(v-slot:content="props")
              li(
                v-for="(item, index) in Object.values(SortEnum)",
                :key="`option_enum__${index}`",
                @click="sortBy(item as SortEnum, props);"
              ) By {{ item }}
      .modal(v-if="selectedItems.length > 0")
        .modal--content
          button.content--button.raised(:class="{'disabled': eachChecked}" @click="selectAllTypes" :disabled="eachChecked") Select All
          .modal--content-cancel
            button.cancel(@click="cancel")
            p Selected {{ selectedItems.length }}
          button.delete(@click="openModal(EnumModalKeys.Delete)") Delete
  .history-page--table
    .history-page--title
      .tr
        .th
        .th.align-left Web address
        .th.align-left Sessions
        .th Last visit
        .th Total time
    .history-page--body(v-if="historyList.length")
      .body--group(
        v-for="(item, index) in historyList",
        :key="`History_key__${index}`",
        :id="`${index}`"
      )
        .tr
          .td
            input.global(
              type="checkbox",
              :id="`${index}`",
              :value="index",
              :checked="isChildSelected(item.sessions)",
              @change="toggleChild(item.sessions, isChildSelected(item.sessions))"
            )
          .td
            .icon(:style="{ backgroundImage: `url(${item.icon})` }")
            p {{ `https://${item.domain}/` }}
          .td.arrow(
            :class="{ active: activeRow === index }",
            @click="toggleRow(index)"
          )
            p {{ item.sessions.length }}
          .td.align-right
            p {{ lastVisit(item.sessions) }}
          .td.align-right
            p {{ timeSpent(item.sessions) }}
        .toggle(v-show="activeRow === index")
          .tr.smaller(
            v-for="(activity, subIndex) in item.sessions",
            :id="`row-${index}-col-${subIndex}`"
          )
            .td
              input.sub(
                type="checkbox",
                :id="`${index}-${subIndex}`",
                :value="`${index}-${subIndex}`",
                :checked="isChecked(activity.id)",
                @change="toggleCheckList(activity.id)"
              )
            .td
              p {{ activity.path }}
            .td
            .td.align-right
              p {{ format("DD.MM.YYYY HH:mm", activity.activity[0].begin) }}
            .td.align-right
              p {{ format("Hh mmm sss", timeSpentCalculation(activity.activity), true) }}
    empty-template.desktop(
      v-else,
      :image-path="'frame-no-dataL.svg'",
      :message="'The history is empty. This list will be filled out after you first visit the website.'"
    )
  delete-modal(
    v-if="isOpen(EnumModalKeys.Delete)",
    :delete-type="`history page`",
    :delete-context="`You won't be able to view this story again after deleting it.`",
    @onSubmit="deleteItem",
    @onClosed="closeModal(EnumModalKeys.Delete)"
  )
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import DropdownComponent from "@/components/common/DropdownComponent.vue";
import EmptyTemplate from "@/components/common/EmptyTemplate.vue";

import DeleteModal from "@/modals/common/DeleteModal.vue";

import { format, sortByDate } from "@/composables/common/dateComposable";
import {
  createStructure,
  timeSpentCalculation,
  totalTimeCalculation,
} from "@/composables/common/trackerPageActions";
import { closeModal, isOpen, openModal } from "@/composables/modalActions";

import { EnumModalKeys } from "@/constants/EnumModalKeys";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";

import {
  HistoryListInterface,
  SessionInterface,
} from "@/types/TrackingInterface";
enum SortEnum {
  date = "date",
  time = "total time",
  session = "session",
}

interface DomainItemInterface {
  icon: string;
  sessions: {
    [key: string]: SessionInterface[];
  };
}
interface HistoryStorageInterface {
  [key: string]: DomainItemInterface;
}
const sortOption = ref<SortEnum>();
const selectedItems = ref<string[]>([]);
const activeRow = ref(-1);
const historyList = ref<HistoryListInterface[]>([]);

const sortBy = (option: SortEnum, props?: { toggleVisibility(): void }) => {
  if (props) {
    props.toggleVisibility();
  }
  historyList.value.sort((a: HistoryListInterface, b: HistoryListInterface) => {
    switch (true) {
      case option === SortEnum.time: {
        return (
          totalTimeCalculation(b.sessions) - totalTimeCalculation(a.sessions)
        );
      }
      case option === SortEnum.session: {
        return b.sessions.length - a.sessions.length;
      }
      default: {
        return sortByDate(
          a.sessions[0].activity[0].begin,
          b.sessions[0].activity[0].begin
        );
      }
    }
  });
  sortOption.value = option;
};

const toggleRow = (index: number) => {
  if (activeRow.value === index) {
    activeRow.value = -1;
  } else {
    activeRow.value = index;
  }
};
const cancel = () => {
  selectedItems.value = [];
  closeModal(EnumModalKeys.Delete);
};

const deleteItem = () => {
  chrome.storage.local.get({ pages: {} }, (result) => {
    if (result.pages) {
      const originPages: HistoryStorageInterface = {};
      const domainKeys = Object.keys(result.pages);
      domainKeys.forEach((domainKey) => {
        const sessionsObj: { [key: string]: SessionInterface[] } = {};
        const sessionsKeys = Object.keys(result.pages[domainKey].sessions);
        sessionsKeys.forEach((sessionKey) => {
          const sessions: SessionInterface[] = [];
          result.pages[domainKey].sessions[sessionKey].forEach(
            (session: SessionInterface) => {
              if (!selectedItems.value.includes(session.id)) {
                sessions.push({ ...session });
              }
            }
          );
          if (sessions.length) {
            sessionsObj[sessionKey] = sessions;
          }
        });
        if (Object.keys(sessionsObj).length) {
          originPages[domainKey] = {
            icon: result.pages[domainKey].icon,
            sessions: sessionsObj,
          };
        }
      });
      chrome.storage.local.get({ pages: {} }, (result) => {
        if (result.pages) {
          chrome.storage.local.set({ pages: originPages });
          historyList.value = createStructure(originPages);
          sortBy(SortEnum.date);
          selectedItems.value = [];
          activeRow.value = -1;
        } else {
          historyList.value = [];
        }
      });
    }
  });
};

const getHistory = () => {
  chrome.storage.local.get({ pages: {} }, (result: any) => {
    if (Object.keys(result.pages).length) {
      historyList.value = createStructure(result.pages);
      sortBy(SortEnum.date);
    }
  });
};
const isChildSelected = (sessions: SessionInterface[]) => {
  return sessions.every((e) => selectedItems.value.includes(e.id));
};

const isChecked = (id: string) => {
  return selectedItems.value.includes(id);
};

const toggleChild = (sessions: SessionInterface[], status: boolean) => {
  sessions.forEach((f) => {
    const index = selectedItems.value.indexOf(f.id);
    if (status) {
      selectedItems.value.splice(index, 1);
    } else if (index === -1) {
      selectedItems.value.push(f.id);
    }
  });
};

const selectAllTypes = () => {
  historyList.value.forEach((item) => {
    toggleChild(item.sessions, false);
  });
};

const eachChecked = computed(() => {
  return historyList.value.every((item) => isChildSelected(item.sessions));
});
const toggleCheckList = (id: string) => {
  const index = selectedItems.value.indexOf(id);
  if (index === -1) {
    selectedItems.value.push(id);
  } else {
    selectedItems.value.splice(index, 1);
  }
};

const lastVisit = (session: SessionInterface[]) => {
  return format("DD.MM.YYYY HH:mm", session[0].activity[0].begin);
};

const timeSpent = (session: SessionInterface[]) => {
  const difference = totalTimeCalculation(session);
  const mask = difference > 86400 ? "DDd Hh mmm sss" : "Hh mmm sss";
  return format(mask, difference, true);
};

onMounted(() => {
  getHistory();
});
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 46px;

  .modal {
    &--content {
      z-index: 2;
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;

      width: 100%;
      padding: 24px;
      column-gap: 44px;

      background: #fdfdfd;
      border-bottom: 1px solid #d9d9d9;

      &-cancel {
        display: flex;
        align-items: center;

        width: 100%;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 17px;
        color: var(--txt-light-grey);
      }

      button {
        &.raised {
          width: 155px;
          min-width: 155px;
          height: 32px;
        }

        &.delete {
          display: flex;
          align-items: center;
          justify-content: center;

          min-width: 120px;
          height: 32px;

          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 19px;

          background: var(--bttn-delete-lightblue);
          border: none;
          color: var(--txt-dark-grey);
          border-radius: 6px;
        }

        &.cancel {
          padding: 0;
          margin-right: 26px;
          width: 23px;
          height: 24px;
          background: none;

          &::before {
            display: inline-block;
            content: "";
            background-image: url("@/assets/remove.svg");
            width: 24px;
            height: 24px;
            min-width: 24px;
            min-height: 24px;
            margin-right: 19px;
          }
        }
      }
    }
  }

  .history {
    margin-top: 3px;
    .history--sorting {
      height: 40px;
    }

    &-page {
      &--table {
        display: flex;
        flex-direction: column;

        padding-top: 45px;
      }

      &--title,
      &--body {
        .tr {
          display: flex;
          width: 100%;

          .td,
          .th {
            font-family: var(--font-nunito);
            font-weight: 500;
            font-size: 12px;
            line-height: 16px;

            color: var(--txt-light-grey);

            &:nth-child(1) {
              min-width: 40px;
            }

            &:nth-child(2) {
              width: 100%;
            }

            &:nth-child(3) {
              min-width: 70px;
            }

            &:nth-child(4) {
              min-width: 168px;
            }

            &:nth-child(5) {
              min-width: 140px;
            }
          }
        }
      }

      &--title {
        padding-bottom: 10px;

        border-bottom: 1px solid var(--txt-anti-flashlight);

        .th {
          text-align: right;

          &.align-left {
            text-align: left;
          }
        }
      }

      &--body {
        .body--group {
          display: flex;
          flex-direction: column;

          .tr {
            height: 40px;
            margin: 12px 0;

            .td {
              display: flex;
              align-items: center;

              p {
                overflow: hidden;

                max-width: 560px;

                font-family: var(--font-nunito);
                font-size: 16px;
                font-weight: 600;
                line-height: 32px;
                white-space: nowrap;
                text-overflow: ellipsis;

                color: var(--txt-main-darkblue);
              }

              .icon {
                width: 32px;
                min-width: 32px;
                height: 32px;
                margin-right: 16px;

                background-color: var(--txt-anti-flashlight);
                background-size: 26px;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 50%;
              }

              input[type="checkbox"] {
                position: relative;
                cursor: pointer;
                line-height: 0;
                vertical-align: text-top;
                outline: 0;

                width: 20px;
                height: 20px;
                min-width: 20px;
                min-height: 20px;

                -webkit-appearance: none;
                background: var(--white);
                border: 1px solid var(--txt-water-link);
                border-radius: 4px;
                background: none;

                &:checked {
                  opacity: 1;

                  background-color: var(--bttn-active-lightblue);
                  border: 1px solid var(--bttn-active-lightblue);

                  &:before {
                    content: "";
                    position: absolute;
                    right: 50%;
                    top: 50%;
                    display: block;
                    z-index: 2;

                    width: 4px;
                    height: 10px;
                    margin: -1px -1px 0 -1px;

                    border: solid var(--txt-light-grey);
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg) translate(-50%, -50%);
                  }
                }
              }

              &.arrow {
                position: relative;
                cursor: pointer;

                &::before {
                  position: absolute;
                  left: 6px;
                  top: 15px;
                  content: "";
                  display: inline-block;
                  cursor: pointer;

                  width: 6px;
                  height: 12px;
                  margin-bottom: 2px;
                  margin-right: 18px;

                  background-image: url("@/assets/icons/arrow-left.svg");
                  transform: rotate(-90deg);
                }

                p {
                  padding-left: 28px;
                }

                &.active {
                  &::before {
                    transform: rotate(90deg);
                    transition: all 0.3s;
                  }
                }
              }

              &.align-right {
                justify-content: flex-end;
              }
            }

            &.smaller {
              .td {
                p {
                  font-size: 12px;
                  font-weight: 500;
                  line-height: 16px;

                  color: var(--txt-water-link);
                }
              }
            }
          }

          .toggle {
            display: flex;
            flex-direction: column;
            overflow: auto;

            max-height: 448px;
            padding: 0 10px 0 30px;

            .tr {
              margin: 0;
              padding: 8px 0 0;
              border-top: 1px solid var(--txt-anti-flashlight);

              .td {
                height: 20px;
                padding: 6px 0;

                &:nth-child(1) {
                  margin-left: 8px;
                }
              }

              &:last-child {
                border-bottom: 1px solid var(--txt-anti-flashlight);
              }
            }
          }
        }
      }
    }
  }
}
</style>
