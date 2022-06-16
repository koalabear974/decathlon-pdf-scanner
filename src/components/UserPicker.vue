<template>
  <v-card class="mx-auto mt-5">
    <v-card-title>Here are the people found in the calendar:</v-card-title>
    <v-card-subtitle>
      Click on a name to get to the personal calendar.
    </v-card-subtitle>
    <v-card-text>
      <v-list>
        <v-list-item-group v-model="selected" active-class="primary--text">
          <v-list-item v-for="people in eventPeople" :key="people">
            <v-list-item-avatar
              color="red"
              class="text-center white--text text-h5"
            >
              {{ getInitials(people) }}
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-html="people"></v-list-item-title>
              <v-list-item-subtitle>
                {{ eventsCountPerPerson(people) }} events found.
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                :color="eventsCountPerPerson(people) > 0 ? 'primary' : 'grey'"
                :disabled="eventsCountPerPerson(people) === 0"
              >
                open
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import _ from "lodash";

export default {
  data: () => ({
    selected: null,
  }),
  computed: {
    ...mapGetters(["eventPeople", "getEventsByPerson"]),
  },
  methods: {
    getInitials(user) {
      return user
        .split(" ")
        .map((n) => n[0])
        .join("");
    },
    eventsCountPerPerson(user) {
      return _.sum(
        this.getEventsByPerson(user).map((e) => Object.keys(e).length)
      );
    },
  },
  watch: {
    selected: function (val) {
      if (this.eventsCountPerPerson(this.eventPeople[val]) > 0) {
        this.$store.dispatch("pickUser", { user: this.eventPeople[val] });
      }
    },
  },
};
</script>
