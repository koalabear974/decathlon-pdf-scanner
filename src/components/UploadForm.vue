<template>
  <v-card class="mx-auto mt-5">
    <v-form :disabled="loading" ref="fileForm" @submit.prevent="uploadFile">
      <v-card-title>
        Upload the calendar pdf file or paste the URL of the file:
      </v-card-title>
      <v-card-text>
        <v-alert v-show="error" type="error"> {{ error }} </v-alert>
        <v-text-field
          v-model="fileUrl"
          :rules="urlRules"
          prepend-icon="mdi-link"
          label="File Link"
        ></v-text-field>
        <v-file-input
          v-model="fileBlob"
          :rules="fileRules"
          accept=".pdf"
          label="File input"
        ></v-file-input>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" type="submit" :disabled="loading">
          Process PDF
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import "pdfjs-dist/build/pdf.worker.entry";

export default {
  data: () => ({
    fileUrl: "",
    fileBlob: null,
    success: false,
    error: false,
    loading: false,
  }),
  computed: {
    urlRules() {
      return [
        (v) => !!v || this.fileBlob !== null || "Url or file is required",
        (v) =>
          this.fileBlob !== null ||
          /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(
            v
          ) ||
          "Invalid URL",
      ];
    },
    fileRules() {
      return [(v) => !!v || this.fileUrl !== "" || "Url or file is required"];
    },
  },
  methods: {
    async uploadFile() {
      this.success = false;
      this.error = false;
      if (!this.$refs.fileForm.validate()) return;
      if (this.fileBlob && this.fileUrl) {
        this.error = "Only one of the upload method has to be used.";
        return;
      }
      this.loading = true;

      const currentUrl = this.fileBlob
        ? URL.createObjectURL(this.fileBlob)
        : this.fileUrl;

      console.log(this.$root.$options.pdfjsLib);
      if (!this.$root.$options.pdfjsLib) {
        this.error = "Error in loading PDF library.";
        this.loading = false;
        return;
      }

      try {
        await this.$store.dispatch("readPdf", {
          url: currentUrl,
          pdfjsLib: this.$root.$options.pdfjsLib,
        });
        this.success = true;
      } catch (e) {
        console.error(e);
        this.error = `An error occurred while processing PDF: ${e.message}.`;
      }
      this.loading = false;
    },
  },
};
</script>
