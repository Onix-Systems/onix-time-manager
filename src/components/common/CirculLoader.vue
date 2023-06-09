<template lang="pug">
.profile-main-loader
  .loader
    svg.circular-loader(viewbox="25 25 50 50")
      circle.loader-path(
        cx="16",
        cy="16",
        r="15",
        fill="none",
        stroke="#386AF1",
        stroke-width="2"
      )
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.profile-main-loader {
  width: 50px;
  height: 50px;
  z-index: 1 !important;

  .loader {
    position: relative;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    &:before {
      content: "";
      display: block;
      padding-top: 100%;
    }

    .circular-loader {
      height: 100%;
      -webkit-transform-origin: center center;
      -ms-transform-origin: center center;
      transform-origin: center center;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      margin: auto;

      .loader-path {
        stroke-dasharray: 150, 200;
        stroke-dashoffset: -10;
        -webkit-animation: dash 1.5s ease-in-out infinite,
          color 6s ease-in-out infinite;
        animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
        stroke-linecap: round;
        transform: scale(1.5);
      }
    }
  }
}

@-webkit-keyframes rotate {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes rotate {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124;
  }
}
@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124;
  }
}
@-webkit-keyframes color {
  0% {
    stroke: var(--txt-dark-blue);
  }
  40% {
    stroke: var(--txt-dark-blue);
  }
  66% {
    stroke: var(--txt-dark-blue);
  }
  80%,
  90% {
    stroke: var(--txt-dark-blue);
  }
}
@keyframes color {
  0% {
    stroke: var(--txt-dark-blue);
  }
  40% {
    stroke: var(--txt-dark-blue);
  }
  66% {
    stroke: var(--txt-dark-blue);
  }
  80%,
  90% {
    stroke: var(--txt-dark-blue);
  }
}
</style>
