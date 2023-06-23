<template lang="pug">
.how-to-use-page
  .option--header
    .option--header-left
      .option--header--title {{ SidebarNamesEnum.UsageView }}
  .description-article
    .toggle-section
      .header.tracking(
        :class="{ open: heightList.tracking }",
        @click="setHeight('tracking')"
      )
        i
        h2 Get started with a tracking
        i.close
      .description(
        ref="tracking",
        :style="{ height: `${heightList.tracking}px` }"
      )
        h3.mt-40 Popup tracking list
        .d-center.pb-20
          img(src="../assets/guide/tracking/tracker_popup.png")
        ol.pb-40
          li "Settings" icon, redirect us to dashboard tracker
          li "Period selector" show tracking list by selected period
          li "Tabs selector" switch between popup views
          li Tracking site item
          li Current active site
        h3 Popup tracking details
        .d-center.pb-20
          img(src="../assets/guide/tracking/tracker_details.png")
        ol.pb-20
          li Date switcher
          li Total usage canculation
          li Tracking schedule based on selected period
          li "Add limit" button, redirect us to dashboard limits
        h3.t-center Schedule variants
        .d-center.col-4.pb-20
          img(src="../assets/guide/tracking/schedule1.png")
          img(src="../assets/guide/tracking/schedule2.png")
          img(src="../assets/guide/tracking/schedule3.png")
          img(src="../assets/guide/tracking/schedule4.png")
        p.pb-40 Tracking: The time management extension only tracks the active tab, it cannot track multiple screens at the same time.
        h3.t-center Tracking Dashboard List
        .d-center.pb-40
          img(src="../assets/guide/tracking/tracker_dashboard.png")
        h3.t-center Tracking Dashboard Details
        .d-center.pb-20
          img(src="../assets/guide/tracking/schedule5.png")
        h3.t-center Schedule variants
          .d-center.col-2x2.pb-20
            img(src="../assets/guide/tracking/schedule5.png")
            img(src="../assets/guide/tracking/schedule6.png")
            img(src="../assets/guide/tracking/schedule7.png")
            img(src="../assets/guide/tracking/schedule8.png")
    .toggle-section
      .header.reverse.permissions(
        :class="{ open: heightList.permissions }",
        @click="setHeight('permissions')"
      )
        i
        h2 Permission rules
        i.close
      .description(
        ref="permissions",
        :style="{ height: `${heightList.permissions}px` }"
      )
        h3.pt-40 Permission default view
        .d-center.pb-20
          img.size-100(src="../assets/guide/permission/default_db_view.png")
        ol.pt-40
          li "No results" template
          li Open "Create new permission" popup
          li "off" Disable all permission rules
          li "whitelist" This feature allows users to proceed session only on selected websites, other will be blocked
          li "blacklist" Blacklisting a website involves blocking its access or preventing it from being displayed to users
        h3.t-center Create new rule
        .d-center.pb-20
          img(src="../assets/guide/permission/create_new_rule.png")
        p.pb-20 To create the permission you need to enter valid URL, in other case we can't save it. "Create new rule" popup is same for whitelist & blacklist, new item will be saved into seperate list.
        p.warning.pb-40 Permission rule will check only domain name, so you don't need to set spesific url. Example
          span https://momentjs.com/docs/#/parsing/string-format/
          | will take
          span https://momentjs.com
        h3.t-center Manage rules
        .d-center.pb-20
          img.size-100(src="../assets/guide/permission/db_black_list.png")
        p.pb-40 On dashboard we have ability to edit website (change it into new one) or we can delete it.
        h3 Permission on popup tab
        .d-center.col-3.pb-20
          img(src="../assets/guide/permission/permission_off.png")
          img(src="../assets/guide/permission/permission_empty.png")
          img(src="../assets/guide/permission/blacklist_selected.png")
        p.pb-40 On popup tab we can view "empty template" when permissions is off or when we had empty list at white/black option, when the list is not empty we can view allowed / disallowed websites.
        h3.t-center White/Black list blocking template
        .d-center.pb-20
          img.size-100(src="../assets/guide/permission/block_template.png")
    .toggle-section
      .header.limit(
        :class="{ open: heightList.limit }",
        @click="setHeight('limit')"
      )
        i
        h2 Time limits
        i.close
      .description(ref="limit", :style="{ height: `${heightList.limit}px` }")
        h3.mt-40 Limits default view
        .d-center.pb-20
          img.size-100(src="../assets/guide/limits/default_db_view.png")
        ol.pt-40
          li "No results" template.
          li General limit switcher, enable/disable general limits.
          li List of limits switcher, enable/disable website limits.
          li Global limit, clicing on it we can view popup where we can set daily limit.
          li "Add new limit" button, need for creating new limits.
        h3.t-center General limit popup
        .d-center.pb-20
          img(src="../assets/guide/limits/general_popup.png")
        h3.t-center Website limits
        .d-center.pb-20
          img(src="../assets/guide/limits/website_limits.png")
        h3.t-center Manage rules
        .d-center.pb-20
          img.size-100(src="../assets/guide/limits/edit_limits.png")
        p.pb-20 On dashboard we have ability to edit website (change it into new one), change daily limit time or delete it.
        p.warning.pb-40 Limits rule will check only domain name, so you don't need to set spesific url. Example
          span https://momentjs.com/docs/#/parsing/string-format/
          | will take
          span https://momentjs.com
          | Daily limits begin calculation when we set daily or web limits. It index only active time, so when we will switched into another application the tracker stop tracking.
          span The Limits are cleared every day.
        h3.t-center Popup view when limits are not set
        .d-center.pb-20
          img(src="../assets/guide/limits/no_limits.png")
        h3.t-center Popup view with global limit
        .d-center.pb-20
          img(src="../assets/guide/limits/general_limits.png")
        h3.t-center Popup view with website limits
        .d-center.pb-20
          img(src="../assets/guide/limits/website_popup_view.png")
        h3.t-center Limits blocking template
        .d-center.pb-20
          img.size-100(src="../assets/guide/limits/block_page_template.png")
    .toggle-section
      .header.reverse.redirect(
        :class="{ open: heightList.redirect }",
        @click="setHeight('redirect')"
      )
        i
        h2 Domain redirections
        i.close
      .description(
        ref="redirect",
        :style="{ height: `${heightList.redirect}px` }"
      )
        h3.mt-40 Redirect default view
        .d-center.col-1x1.pb-20
          img.size-100(src="../assets/guide/redirect/default_view.png")
          img.size-100(src="../assets/guide/redirect/edit_view.png")
        ol.pt-40
          li "No results" template
          li Open "Create new permission" popup
          li Edit redirection
          li Delete redirection
        h3.t-center Manage rules
        .d-center.pb-20
          img.size-100(src="../assets/guide/redirect/edit_popup.png")
        p.pb-20 On dashboard we have ability to edit website (change it into new one) or delete it.
        p.warning.pb-40 The redirect rule checks the full URL, not the domain. Example
          span https://momentjs.com/docs/#/parsing/string-format/
          | will take
          span https://momentjs.com/docs/#/parsing/string-format/
          | After redirection you will receive a message:
          span "You have been redirected from #SiteName due to settings, please check on dashboard."
    .toggle-section
      .header.history(
        :class="{ open: heightList.history }",
        @click="setHeight('history')"
      )
        i
        h2 Tracking history
        i.close
      .description(
        ref="history",
        :style="{ height: `${heightList.history}px` }"
      )
        h3.pt-40 History options
        .d-center.pb-20
          img.size-100(src="../assets/guide/history/default_view.png")
        ol.pt-40
          li History list sorting. Possible varians: by date, by total time, by visits
          li History items
          li Visits count, number of visited sessions
          li Last visit date
          li Total time
          li Website domain
          li Checkbox for selecting website, it can be used for delete feature
          li Dropdown icon, show website visit list
        h3.t-center Website visit list
        .d-center.pb-20
          img.size-100(src="../assets/guide/history/visit_dropdown.png")
        p.pb-20 Here we can view all visits, select and remove unused sessions, hovering on website we can view a hyperlink.
        .d-center.pb-20
          img.size-100(src="../assets/guide/history/delete_view.png")
        p.pb-20 User can delete specific url or full website sessions. Before deletion submit we will see "Are you sure" template, to be confirmed we want to delete it.
        .d-center.pb-40
          img.size-100(src="../assets/guide/history/are_you_sure_template.png")
    .toggle-section
      .header.reverse.settings(
        :class="{ open: heightList.settings }",
        @click="setHeight('settings')"
      )
        i
        h2 Extension settings
        i.close
      .description(
        ref="settings",
        :style="{ height: `${heightList.settings}px` }"
      )
        h3.pt-40 Basic settings configurations
        .d-center.pb-20
          img.size-100(src="../assets/guide/settings/default_view.png")
        ol.pt-40
          li Parent control switcher
          li Disable or enable permission feature.
          li Show/hide notifications
          li Notification message, you can change it, maximum length 150 characters
          li Reset all data to default
        h3.t-center Parent control
        .d-center.pb-20
          img.size-100(src="../assets/guide/settings/parent_control.png")
        p.pb-40 The Child Mode setting allows users to enable or disable a child-friendly mode in the Time Management web extension. When enabled, this mode typically restricts access to certain websites or features to ensure a safe browsing experience for children. Users can configure the specific websites or features they want to restrict, and the extension will enforce those restrictions accordingly.
        h3.t-center Reset to default
        .d-center.pb-20
          img.size-100(src="../assets/guide/settings/reset_data.png")
        p.pb-40 The "Delete Data" button is a feature that allows users to restore settings, configurations, or values to their original default state. By clicking this button, any changes made to the settings or preferences within a system, application, or device can be reverted back to the original factory or default settings.
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

import { SidebarNamesEnum } from "@/constants/menuItemsEnum";

enum TabEnum {
  tracking = "tracking",
  permissions = "permissions",
  limit = "limit",
  redirect = "redirect",
  history = "history",
  settings = "settings",
}
interface TabInterface {
  tracking: number;
  permissions: number;
  limit: number;
  redirect: number;
  history: number;
  settings: number;
}
const heightList = ref<TabInterface>({
  tracking: 0,
  permissions: 0,
  limit: 0,
  redirect: 0,
  history: 0,
  settings: 0,
});
const tracking = ref<Element | null>(null);
const permissions = ref<Element | null>(null);
const limit = ref<Element | null>(null);
const redirect = ref<Element | null>(null);
const history = ref<Element | null>(null);
const settings = ref<Element | null>(null);

const setHeight = (scope: keyof TabInterface) => {
  if (heightList.value[scope as keyof TabInterface]) {
    heightList.value[scope] = 0;
  } else {
    const keys = Object.keys(heightList.value);
    keys.forEach((key) => {
      heightList.value[key as keyof TabInterface] = 0;
    });
    let currentRef: Element | { children: Element[] };
    switch (scope) {
      case TabEnum.tracking: {
        currentRef = tracking.value!;
        break;
      }
      case TabEnum.permissions: {
        currentRef = permissions.value!;
        break;
      }
      case TabEnum.limit: {
        currentRef = limit.value!;
        break;
      }
      case TabEnum.redirect: {
        currentRef = redirect.value!;
        break;
      }
      case TabEnum.history: {
        currentRef = history.value!;
        break;
      }
      case TabEnum.settings: {
        currentRef = settings.value!;
        break;
      }
    }
    const children: (Element | { offsetHeight: number })[] = Object.values(
      currentRef!.children
    );
    heightList.value[scope] = children.reduce(
      (a: number, b) => a + (b as { offsetHeight: number }).offsetHeight,
      0
    );
  }
};
</script>

<style scoped lang="scss">
.how-to-use-page {
  .description-article {
    max-width: 660px;
    margin: 40px auto;

    .toggle-section {
      position: relative;
      display: flex;
      flex-direction: column;

      max-width: 660px;
      margin: 0 auto 36px;
      padding-bottom: 36px;

      border-bottom: 1px solid var(--bttn-active-lightblue);

      .header {
        display: flex;
        align-items: center;
        cursor: pointer;

        padding-right: 0;
        transition: padding-right 0.4s ease-in;

        h2 {
          font-style: normal;
          font-weight: 600;
          font-size: 28px;
          line-height: 32px;

          color: var(--txt-main-darkblue);
        }

        &.tracking i {
          background-image: url("@/assets/icons/options-nav/clock-circle-active.svg");
        }

        &.permissions i {
          background-image: url("@/assets/icons/options-nav/browser-active.svg");
        }

        &.limit i {
          background-image: url("@/assets/icons/options-nav/warning-polygon-active.svg");
        }

        &.redirect i {
          background-image: url("@/assets/icons/options-nav/arrow-return-active.svg");
        }

        &.history i {
          background-image: url("@/assets/icons/options-nav/user-polygon-active.svg");
        }

        &.settings i {
          background-image: url("@/assets/icons/options-nav/setting-active.svg");
        }

        &.reverse {
          flex-direction: row-reverse;
          justify-content: space-between;

          i {
            margin-right: 0;
          }
        }

        i {
          display: block;

          width: 60px;
          height: 60px;
          margin-right: 46px;

          background-size: contain;

          &.close {
            display: none;
            position: absolute;
            top: 38px;
            right: 10px;
            cursor: pointer;

            width: 14px;
            height: 14px;
            margin: -1px -1px 0 -1px;

            border: solid var(--txt-dark-blue);
            border-width: 3px 0 0 3px;
            background-image: unset;
            transform: rotate(45deg) translate(-50%, -50%);
          }
        }

        &.open {
          padding-right: 45px;

          .close {
            display: block;
          }
        }
      }

      .description {
        overflow: hidden;

        transition: height 0.4s ease-in;

        h3 {
          padding: 16px 0;

          font-weight: 600;
          font-size: 24px;
          line-height: 32px;

          color: var(--txt-main-darkblue);
        }

        p {
          font-weight: 600;
          font-size: 18px;
          line-height: 24px;

          color: var(--txt-dark-grey);

          span {
            padding: 0 10px;

            font-weight: 700;
            color: var(--txt-main-darkblue);
          }
        }

        .d-center {
          display: flex;
          justify-content: center;

          &.col-4 {
            justify-content: space-between;

            img {
              width: 24%;
            }
          }

          &.col-3 {
            justify-content: space-between;

            img {
              width: 31%;
            }
          }

          &.col-2 {
            justify-content: space-between;

            img {
              width: 48%;
            }
          }

          &.col-2x2 {
            justify-content: center;
            flex-wrap: wrap;

            gap: 10px;

            img {
              width: 45%;
            }
          }

          &.col-1x1 {
            justify-content: center;
            flex-wrap: wrap;

            gap: 10px;
          }
        }

        .t-center {
          text-align: center;
        }

        .pb-20 {
          padding-bottom: 20px;
        }
        .pb-40 {
          padding-bottom: 40px;
        }
        .pt-40 {
          padding-top: 40px;
        }

        img {
          width: 400px;
          margin: auto;
          padding: 16px 0;

          border: 1px solid var(--bttn-active-lightblue);

          &.size-100 {
            width: 96%;
          }
        }

        ol {
          margin-left: 28px;
          list-style: auto;

          li {
            padding: 4px 0;
            font-weight: 600;
            font-size: 18px;
            line-height: 24px;

            color: var(--txt-dark-grey);
          }
        }
      }
    }
  }
}
</style>
