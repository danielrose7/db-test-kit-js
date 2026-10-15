import DefaultTheme from "vitepress/theme";
import TransactionSketch from "./TransactionSketch.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("TransactionSketch", TransactionSketch);
  },
};
