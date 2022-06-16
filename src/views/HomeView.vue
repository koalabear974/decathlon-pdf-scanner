<template>
  <v-container>
    <UploadForm v-show="!hasProcessedPdf" />
    <UserPicker v-show="hasProcessedPdf && !hasPickedUser" />
    <CalendarPage v-show="hasProcessedPdf && hasPickedUser" />
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import UploadForm from "../components/UploadForm";
import UserPicker from "../components/UserPicker";
import CalendarPage from "../components/CalendarPage";
import _ from "lodash";

export default {
  name: "HomeView",
  components: { UploadForm, UserPicker, CalendarPage },
  data: () => ({}),
  computed: {
    hasProcessedPdf() {
      return !_.isEmpty(this.calendarData);
    },
    hasPickedUser() {
      return this.pickedUser !== "";
    },
    ...mapGetters(["calendarData", "pickedUser"]),
  },
  methods: {},
};
</script>
