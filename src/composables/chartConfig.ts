import { computed, onMounted, ref } from "vue";
export const storage = ref([]);

export const isWeek = ref(0);
export const activeSite = ref(0);
export const editActiveSite = (item: string, index: number) => {
  item !== "others" ? (activeSite.value = index) : "";
};

export const editWeek = (index: number) => {
  isWeek.value = index;
};

export const updateStorage = () => {
  chrome.storage.local.get(["pages"], (result) => {
    storage.value = result.pages;
  });
};

export const data = computed(() => {
  const timeSpentArray = topTasks.value.map((task: any) => task.timeSpent);
  const labelsArray = topTasks.value.map(
    (task: any) =>
      `${((task.timeSpent / totalValue.value) * 100).toFixed(0)}%\n ${
        task.url
      }\n${task.visited} visits`
  );
  return {
    labels: labelsArray,
    datasets: [
      {
        label: "Time Spent",
        data: timeSpentArray,
        backgroundColor: colors,
        borderRadius: 10,
        borderWidth: 0.5,
      },
    ],
  };
});

export const colors = [
  "#5767E2",
  "#8A56E2",
  "#CE55E2",
  "#E256AE",
  "#E25668",
  "#E28957",
  "#E2CF56",
  "#AFE156",
  "#69E256",
];

const getOrCreateTooltip = (chart: {
  canvas: {
    parentNode: {
      querySelector: (arg0: string) => any;
      appendChild: (arg0: any) => void;
    };
  };
}) => {
  let tooltipEl = chart.canvas.parentNode.querySelector("div");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.style.background = "rgba(0, 0, 0, 0)";
    tooltipEl.style.color = "#000000";
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.position = "absolute";
    tooltipEl.style.transform = "translate(-44%, 54px)";
    tooltipEl.style.transition = "all .1s ease";

    const table = document.createElement("div");
    table.style.margin = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};
const externalTooltipHandler = (context: { chart: any; tooltip: any }) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b: { lines: any }) => b.lines);

    const tableHead = document.createElement("div");

    titleLines.forEach((title: string) => {
      const tr = document.createElement("p");
      tr.classList.add("my-class");
      // tr.style.borderWidth = 0;

      // const th = document.createElement("p");
      // tr.classList.add("my-clas");
      // th.style.borderWidth = 0;
      const text = document.createTextNode(title);

      tr.appendChild(text);
      // tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector("div");

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }
    tableRoot.appendChild(tableHead);
  }
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = "206px";
  tooltipEl.style.top = "200px";
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding =
    tooltip.options.padding + "px " + tooltip.options.padding + "px";
};
export const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%",
  spacing: 10,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
      position: "nearest",
      external: externalTooltipHandler,
    } as {
      enabled: boolean;
      position?: string;
      external?: any;
    },
  },
};

export const labels = computed(() => {
  const array = [...topTasks.value.map((task: any) => task.url)];
  if (sortedData.value && sortedData.value.length > 8) {
    array.push("others");
  }
  return array;
});

export const formatTime = (
  timeSpent: number,
  short = true,
  showHour = false
): string => {
  const seconds = Math.floor(timeSpent);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const sec = seconds % 60;
  const min = minutes % 60;
  const hour = hours % 24;

  const padZero = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  const timeArray = [];
  if (hour > 0 || showHour) {
    timeArray.push(short ? `${padZero(hour)}h` : `${padZero(hour)} hours`);
  }
  if (min > 0 || showHour) {
    timeArray.push(short ? `${padZero(min)}m` : `${padZero(min)} minutes`);
  }
  if (sec > 0) {
    timeArray.push(short ? `${padZero(sec)}s` : `${padZero(sec)} seconds`);
  }

  if (timeArray.length === 0) return "0s";
  return timeArray.join(" ");
};

export const getPercent = (timeSpent: number) => {
  return ((timeSpent / totalValue.value) * 100).toFixed(2) + "%";
};

export const sevenDays: any = ref([]);
// Sort the data by timeSpent
export const sortedData = computed(() => {
  if (storage.value && storage.value.length) {
    const today = new Date().toLocaleDateString();
    const todayPage = storage.value.filter(
      (page: any) => page.history[0].day === today
    );

    for (let i = 0; i < 7; i++) {
      sevenDays.value.push(
        new Date(
          new Date().getTime() - i * 24 * 60 * 60 * 1000
        ).toLocaleDateString()
      );
    }
    const weekPage: any = storage.value.filter((page: any) => {
      return page.history.filter((item: any, index: number) => {
        if (!sevenDays.value.includes(item.day)) {
          page.history.splice(index, 1);
        }
        return sevenDays.value.includes(item.day);
      });
    });
    const data = isWeek.value ? todayPage : weekPage;

    return data.sort((a: any, b: any) => b.timeSpent - a.timeSpent);
  } else {
    return [];
  }
});

// Calculate the total value
export const totalValue = computed(() => {
  if (isWeek.value) {
    return sortedData.value.reduce(
      (acc: any, curr: any) => acc + curr.history[0].timeSpent,
      0
    );
  } else {
    return sortedData.value.reduce(
      (acc: any, curr: any) =>
        acc +
        curr.history.reduce(
          (total: any, item: any) => total + item.timeSpent,
          0
        ),
      0
    );
  }
});

// Take the top 8 tasks and sum their timeSpent values
export const topTasks: any = computed(() => {
  return sortedData.value.slice(0, 8);
});
const topTasksValue = computed(() => {
  if (isWeek.value) {
    return topTasks.value.reduce(
      (acc: any, curr: any) =>
        acc +
        curr.history.reduce(
          (total: any, item: any) => total + item.timeSpent,
          0
        ),
      0
    );
  } else {
    return topTasks.value.reduce(
      (acc: any, curr: any) => acc + curr.history[0].timeSpent,
      0
    );
  }
});

// Add a new "Other" task
const otherValue = computed(() => {
  return sortedData.value && sortedData.value.length > 8
    ? totalValue.value - topTasksValue.value
    : 0;
});
