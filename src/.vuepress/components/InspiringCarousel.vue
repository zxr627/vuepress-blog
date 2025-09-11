<template>
  <div class="inspiring-carousel">
    <transition name="fade" mode="out-in">
      <p :key="currentIndex">{{ inspiring[currentIndex] }}</p>
    </transition>
  </div>
</template>

<script>
export default {
  name: "InspiringCarousel",
  props: {
    inspiring: {
      type: Array,
      required: true,
    },
    timeout: {
      type: Number,
      default: 3000, // 切换间隔，ms
    },
  },
  data() {
    return {
      currentIndex: 0,
      intervalId: null,
    };
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.currentIndex =
          (this.currentIndex + 1) % this.inspiring.length;
    }, this.timeout);
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
  },
};
</script>

<style scoped>
.inspiring-carousel {
  font-size: 1.2em;
  color: #fff;
  text-align: center;
  margin-top: 1rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
