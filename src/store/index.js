/* eslint-disable no-empty-pattern, no-unused-vars */
import Vue from "vue";
import Vuex from "vuex";
import {
  combinePages,
  extractDataPerLines,
  filterNonTimeLinesAndCases,
  readPdfUrl,
} from "@/helpers/PdfDataHelper";
import { extractCalendar } from "@/helpers/CalendarHelper";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    calendarData: {},
    pickedUser: "",
    pdfUrl: "",
    googleUserSignedIn: false,
  },
  mutations: {
    SET_PDF_URL(state, { url }) {
      state.pdfUrl = url;
    },
    SET_CALENDAR_DATA(state, { data }) {
      state.calendarData = data;
    },
    SET_PICKED_USER(state, { user }) {
      state.pickedUser = user;
    },
    SET_GOOGLE_USER(state, { signedIn }) {
      state.googleUserSignedIn = signedIn;
    },
  },
  getters: {
    calendarData(state) {
      return state.calendarData || {};
    },
    pdfUrl(state) {
      return state.pdfUrl || "";
    },
    dateLine(state) {
      return state.calendarData.dateLine || {};
    },
    eventArray(state) {
      return state.calendarData.eventArray || {};
    },
    pickedUser(state) {
      return state.pickedUser || "";
    },
    eventPeople(state) {
      if (!state.calendarData.eventArray) return {};
      return Object.keys(state.calendarData.eventArray);
    },
    getEventsByPerson: (state) => (user) => {
      if (!state.calendarData.eventArray) return [];
      return state.calendarData.eventArray[user];
    },
    isSignedInGoogle(state) {
      return state.googleUserSignedIn;
    },
  },
  actions: {
    readPdf: async ({ commit }, { url, pdfjsLib }) => {
      const pagesContent = await readPdfUrl(url, pdfjsLib);
      let linesArray2 = extractDataPerLines(combinePages(pagesContent));
      linesArray2 = filterNonTimeLinesAndCases(linesArray2);
      commit("SET_CALENDAR_DATA", { data: extractCalendar(linesArray2) });
      commit("SET_PDF_URL", { url });
    },
    pickUser: ({ commit }, { user }) => {
      commit("SET_PICKED_USER", { user });
    },
    updateGoogleSignInStatus: ({ commit }, { signedIn }) => {
      commit("SET_GOOGLE_USER", { signedIn });
    },
  },
  modules: {},
});
