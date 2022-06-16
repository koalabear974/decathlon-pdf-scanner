import config from "@/config/config.json";
import store from "@/store";

export default class googleApi {
  constructor() {
    const script = document.createElement("script");
    const self = this;
    script.onload = function () {
      self.handleClientLoad();
    };
    script.async = true;
    script.defer = true;
    script.src = "https://apis.google.com/js/api.js";
    document.head.appendChild(script);
  }
  handleClientLoad() {
    if (!window.gapi) return;
    window.gapi.load("client:auth2", this.initClient.bind(this));
  }
  async initClient() {
    if (!window.gapi) return;
    try {
      await window.gapi.client.init({
        apiKey: config.googleApi.apiKey,
        clientId: config.googleApi.clientID,
        discoveryDocs: config.googleApi.discoverDocs,
        scope: config.googleApi.scopes,
      });
      // Listen for sign-in state changes.
      window.gapi.auth2
        .getAuthInstance()
        .isSignedIn.listen(this.updateSignInStatus);

      // // Handle the initial sign-in state.
      this.updateSignInStatus(
        window.gapi.auth2.getAuthInstance().isSignedIn.get()
      );
    } catch (e) {
      console.log("Google API Error:" + e.message);
    }
  }
  updateSignInStatus(isSignedIn) {
    store.dispatch("updateGoogleSignInStatus", {
      signedIn: isSignedIn,
    });
  }
  async signIn() {
    if (!window.gapi) return;
    await window.gapi.auth2.getAuthInstance().signIn();
  }
  signOut() {
    if (!window.gapi) return;
    window.gapi.auth2.getAuthInstance().signOut();
  }
  // eslint-disable-next-line no-unused-vars
  async uploadEvents(events) {
    try {
      await new Promise((res) => {
        window.gapi.client.load("calendar", "v3", res);
      });
    } catch (e) {
      return {
        success: false,
        error: "Couldn't load calendar API: " + e.message,
      };
    }

    let calendarRes;
    try {
      calendarRes = await new Promise((res) => {
        window.gapi.client.calendar.calendarList
          .list({
            maxResults: 250,
            minAccessRole: "writer",
          })
          .execute(res);
      });
    } catch (e) {
      return {
        success: false,
        error: "Error in fetching calendar list: " + e.message,
      };
    }
    const calendars = calendarRes.items;
    let calendarId = "";
    try {
      if (!calendars.map((cal) => cal.summary).includes("Decathlon Agenda")) {
        const newCalRes = await new Promise((res) => {
          window.gapi.client.calendar.calendars
            .insert({
              summary: "Decathlon Agenda",
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            })
            .execute(res);
        });
        calendarId = newCalRes.id;
      } else {
        calendarId = calendars.find((c) => c.summary === "Decathlon Agenda").id;
      }
    } catch (e) {
      return {
        success: false,
        error: "Error in creating or finding Decathlon calendar: " + e.message,
      };
    }

    let gEvents = events.map((e) => {
      return Object.keys(e).map((k) => {
        return {
          summary: k,
          start: {
            dateTime: e[k][0].format(),
          },
          end: {
            dateTime: e[k][1].format(),
          },
        };
      });
    });
    gEvents = [].concat.apply([], gEvents);

    let eventsRes;
    try {
      eventsRes = await new Promise((res) => {
        window.gapi.client.calendar.events
          .list({
            calendarId,
            timeMin: gEvents[0].start.dateTime,
            singleEvents: true,
            maxResults: 10,
            orderBy: "startTime",
          })
          .then(res);
      });
    } catch (e) {
      return {
        success: false,
        error: "Error in fetching Decathlon calendar events: " + e.message,
      };
    }
    const loadedEvents = eventsRes.result.items;
    if (
      loadedEvents.length > 0 &&
      loadedEvents[0].summary === gEvents[0].summary
    ) {
      return {
        success: false,
        error:
          "Caution it seems like this calendar have been already imported.",
      };
    }

    try {
      const batch = window.gapi.client.newBatch();
      gEvents.forEach((e) => {
        batch.add(
          window.gapi.client.calendar.events.insert({
            calendarId,
            resource: e,
          })
        );
      });

      return batch.then(function () {
        return {
          success: true,
          error: "",
        };
      });
    } catch (e) {
      return {
        success: false,
        error: "Error in creating the new events: " + e.message,
      };
    }
  }
}
