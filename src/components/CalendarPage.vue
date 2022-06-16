<template>
  <v-card class="mx-auto mt-5">
    <v-card-title>Here is {{ pickedUser }} calendar:</v-card-title>
    <v-card-subtitle>
      Please double check that generated events are correct.
    </v-card-subtitle>
    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn
            class="ml-2 mb-2"
            :color="googleSuccess ? 'success' : 'primary'"
            @click="authorizeGoogle"
            :disabled="googleLoading"
          >
            <v-icon left>
              {{ googleSuccess ? "mdi-check" : "mdi-google" }}
            </v-icon>
            {{
              googleSuccess ? "Google Calendar loaded" : "Get Google Calendar"
            }}
          </v-btn>
          <v-btn
            class="ml-2 mb-2"
            v-show="isSignedInGoogle"
            color="error"
            @click="this.$root.$options.googleApi.signOut"
          >
            <v-icon left> mdi-google </v-icon>
            Sign out from Google
          </v-btn>
          <v-btn
            class="ml-2 mb-2"
            :color="icsSuccess ? 'success' : 'primary'"
            @click="downloadICSFile"
            :disabled="icsLoading"
          >
            <v-icon left>
              {{ icsSuccess ? "mdi-check" : "mdi-apple" }}
            </v-icon>
            {{ icsSuccess ? "iCal Downloaded" : "Download iCal" }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
    <v-card-text>
      <v-alert v-if="error" type="error">
        {{ error }}
      </v-alert>
      <v-calendar
        ref="calendar"
        :now="today"
        :value="today"
        :events="events"
        :first-interval="7"
        :interval-minutes="60"
        :interval-count="15"
        :weekdays="[1, 2, 3, 4, 5, 6, 0]"
        color="primary"
        type="week"
      ></v-calendar>
      <v-spacer></v-spacer>
      <vue-pdf-embed :source="pdfUrl"></vue-pdf-embed>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import VuePdfEmbed from "vue-pdf-embed/dist/vue2-pdf-embed";
// eslint-disable-next-line no-unused-vars
import { downloadFile, generateICSFile } from "@/helpers/ICSFileHelper";

export default {
  components: { VuePdfEmbed },
  data: () => ({
    googleLoading: false,
    googleSuccess: false,
    icsLoading: false,
    icsSuccess: false,
    error: "",
  }),
  computed: {
    ...mapGetters([
      "pickedUser",
      "dateLine",
      "getEventsByPerson",
      "pdfUrl",
      "isSignedInGoogle",
    ]),
    personEvents() {
      return this.getEventsByPerson(this.pickedUser);
    },
    today() {
      return this.dateLine && this.dateLine[0]
        ? this.dateLine[0].format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD");
    },
    events() {
      if (!this.personEvents) return [];
      const weeklyEvents = this.personEvents.map((we) => {
        return Object.keys(we).map((key) => {
          return {
            name: key.replace("Decathlon ", ""),
            start: we[key][0].format("YYYY-MM-DD HH:mm"),
            end: we[key][1].format("YYYY-MM-DD HH:mm"),
          };
        });
      });
      return [].concat.apply([], weeklyEvents);
    },
  },
  methods: {
    async authorizeGoogle() {
      this.googleLoading = true;
      if (this.isSignedInGoogle) {
        const gResults = await this.$root.$options.googleApi.uploadEvents(
          this.personEvents
        );
        this.googleSuccess = gResults.success;
        this.error = gResults.error;
      } else {
        await this.$root.$options.googleApi.signIn();
      }
      this.googleLoading = false;
    },
    async downloadICSFile() {
      this.icsLoading = true;

      const generatedFile = generateICSFile(this.personEvents);
      downloadFile(generatedFile, "Decathlon_ical.ics");
      this.icsLoading = false;
      this.icsSuccess = true;
    },
  },
  mounted() {},
};
</script>
