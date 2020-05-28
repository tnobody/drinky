<template>
  <div
    id="app-canvas"
    class="flex flex-col bg-black h-screen w-screen text-blue-200 container mx-auto"
  >
    <div
      class="absolute top-0 left-0 right-0 bottom-0 z-50 bg-opacity-50 duration-200 transition bg-black"
      v-if="open"
    ></div>
    <aside
      v-if="hasNav"
      class="absolute w-2/3 top-0 left-0 bg-black bottom-0 z-50 transform shadow-xl transition duration-200 ease-in"
      v-bind:class="{ '-translate-x-full': !open }"
    >
      <button @click="open = !open">&times;</button>
    </aside>

    <header
      class="text-blue-200 flex justify-between content-center items-center"
    >
      <button class="h-6 w-6 m-2 text-blue-300" @click="open = !open" v-if="hasNav">
        <svg
          viewBox="0 0 32 32"
          class="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <path
            class="fill-current"
            d="M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z"
          ></path>
        </svg>
      </button>
      <h1 class="text-3xl flex-1 text-center">Drinky</h1>
      <div class="h-8 w-8"></div>
    </header>
    <article class="flex-1 flex flex-col my-4 space-y-4 justify-center">
      <div class="px-4">
        <div class="flex flex-col">
          <span class="text-6xl">
            {{ drankToday }}
            <span class="text-opacity-50 text-blue-200">l</span>
          </span>
          <span class="text-opacity-25 text-blue-200">Getrunken</span>
        </div>
      </div>
      <div style="padding-top: 56.25%" class="w-full relative">
        <div class="absolute top-0 left-0 w-full h-full">
          <Chart v-bind:data="chartData" v-bind:target="target" />
        </div>
      </div>
      <section
        class="text-2xl text-gray-100 justify-center space-x-4 items-center flex"
      >
        <button @click="addDay(-1)">
          <svg viewBox="0 0 10 10" class="w-6 h-6">
            <path
              d="    M6,2
                     L 4,5
                     L 6,8"
              style="stroke-width: 1"
              stroke-linejoin="round"
              stroke-linecap="round"
              class="stroke-current"
            ></path>
          </svg>
        </button>
        <button>{{ dateIntl }}</button>
        <button @click="addDay(1)">
          <svg viewBox="0 0 10 10" class="w-6 h-6">
            <path
              d="    M4,2
                     L 6,5
                     L 4,8"
              style="stroke-width: 1"
              stroke-linejoin="round"
              stroke-linecap="round"
              class="stroke-current"
            ></path>
          </svg>
        </button>
      </section>
    </article>
    <footer class="px-4 pb-4">
      <div class="flex justify-center space-x-4 h-20">
        <DrinkButton @click="handleClick" v-bind:amount="0.2"></DrinkButton>
        <DrinkButton @click="handleClick" v-bind:amount="0.3"></DrinkButton>
        <DrinkButton @click="handleClick" v-bind:amount="0.5"></DrinkButton>
        <DrinkButton @click="handleClick" v-bind:amount="0.7"></DrinkButton>
      </div>
    </footer>
  </div>
</template>
<script>
import DrinkButton from "./DrinkButton.vue";
import Chart from "./Chart.vue";
import * as db from "./db";
import {
  getHours,
  addHours,
  endOfDay,
  startOfDay,
  addDays,
  getTime,
} from "date-fns";

export default {
  components: {
    DrinkButton,
    Chart,
  },
  data() {
    return {
      hasNav: false,
      open: false,
      date: Date.now(),
      target: 3,
      drank: [],
    };
  },
  watch: {
    date(old, now) {
      this.loadData();
    },
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.drank = await db.readAll({
        fromDate: getTime(startOfDay(this.date)),
        toDate: getTime(endOfDay(this.date)),
      });
    },
    addDay(offset) {
      this.date = getTime(addDays(this.date, offset));
    },
    async handleClick(amount) {
      const entry = { date: Date.now(), amount };
      this.drank.push(entry);
      await db.insert(entry);
    },
  },
  computed: {
    dateIntl() {
      return Intl.DateTimeFormat().format(this.date);
    },
    drankToday() {
      return this.drankAccumulated.reduce(
        (max, { amountAccumulated }) => Math.max(max, amountAccumulated),
        0
      );
    },
    chartData() {
      return [
        { x: 0, y: 0 },
        ...this.drankAccumulated.map(({ amountAccumulated, date }) => ({
          x: getHours(date),
          y: amountAccumulated,
        })),
        { x: 160, y: this.drankToday },
      ];
    },

    drankAccumulated() {
      return [...this.drank]
        .sort((a, b) => a.date - b.date)
        .reduce((acc, curr) => {
          const lastAccItem = acc[acc.length - 1];
          const last = lastAccItem ? lastAccItem.amountAccumulated : 0;
          return [...acc, { ...curr, amountAccumulated: last + curr.amount }];
        }, []);
    },
  },
};
</script>
